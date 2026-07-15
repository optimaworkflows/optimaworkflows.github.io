const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

// ====================================================================
// CONFIGURATION
// ====================================================================
const ASSET_1_SHEET_API = "https://script.google.com/macros/s/AKfycbzP0gBXxSyEmoq7bMCXl61ur7a95hn9JaeZCX7G99d2KzV5o6TCBvwFaqqmSv8mTDY9hw/exec";
const ASSET_2_SHEET_API = "https://script.google.com/macros/s/AKfycbylZa7JbhWa3DDQlBLsQ8QbawB-2Z1dbZV2AzcABxxGqGLnEqq9DxwBMLg22ngDqPEA/exec";
const ASSET_3_SHEET_API = "https://script.google.com/macros/s/AKfycbziOGEsjpb8jBZ7lB0velW_MAC1ooEb5XtTpQhlU0xTP2mHeNh5Ofb84vxM-Vbm13RB/exec";

const MODERN_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// ====================================================================
// SYSTEMATIC US GEOGRAPHIC COVERAGE
// ====================================================================
// A region-balanced list of major US metro hubs — deliberately spans every
// major region (not just the Sun Belt cities the original 5-city lists
// leaned on) so a full rotation actually covers the whole country rather
// than one corner of it repeatedly.
const US_METRO_HUBS = [
    // Northeast
    "New York NY", "Boston MA", "Philadelphia PA", "Pittsburgh PA", "Newark NJ", "Buffalo NY",
    // Mid-Atlantic
    "Baltimore MD", "Washington DC", "Richmond VA", "Norfolk VA",
    // Southeast
    "Atlanta GA", "Charlotte NC", "Raleigh NC", "Nashville TN", "Memphis TN",
    "Jacksonville FL", "Orlando FL", "Miami FL", "Tampa FL", "Birmingham AL",
    // Midwest
    "Chicago IL", "Detroit MI", "Columbus OH", "Cleveland OH", "Cincinnati OH",
    "Indianapolis IN", "Milwaukee WI", "Minneapolis MN", "St Louis MO", "Kansas City MO",
    // South / Texas
    "Houston TX", "Dallas TX", "San Antonio TX", "Austin TX", "Fort Worth TX",
    "New Orleans LA", "Oklahoma City OK",
    // Mountain West
    "Denver CO", "Salt Lake City UT", "Phoenix AZ", "Tucson AZ", "Albuquerque NM", "Las Vegas NV",
    // Pacific / West Coast
    "Los Angeles CA", "San Diego CA", "San Francisco CA", "Sacramento CA",
    "San Jose CA", "Portland OR", "Seattle WA", "Spokane WA"
];

const STATE_FILE = path.join(__dirname, 'scraper-state.json');

/**
 * Loads the persisted per-asset city cursor from disk. Each asset advances
 * through US_METRO_HUBS independently and in order — this is what makes
 * coverage "systematic": run N picks up exactly where run N-1 left off,
 * rather than re-rolling a random city (and possibly repeating the same
 * handful) every time.
 */
function loadState() {
    try {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {
        return {}; // no state file yet — every asset starts at index 0
    }
}

function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
        console.error(`⚠️ Could not persist scraper-state.json: ${e.message}`);
    }
}

/**
 * Returns the next hub city for a given asset key and advances that
 * asset's cursor. Wraps back to index 0 after the full list is exhausted,
 * so coverage repeats the full US sweep rather than stopping.
 */
function getNextHub(state, assetKey) {
    const cursor = state[assetKey] || 0;
    const hub = US_METRO_HUBS[cursor % US_METRO_HUBS.length];
    state[assetKey] = (cursor + 1) % US_METRO_HUBS.length;
    return hub;
}

/**
 * Resilient page navigation with retry logic AND a hard external timeout.
 *
 * Puppeteer's own `timeout` option can fail to fire when a tab's renderer
 * becomes unresponsive (common under memory pressure) — there's no live
 * process left to report the timeout, so the goto() promise just hangs
 * forever. Retrying navigation on that same wedged tab repeats the hang.
 *
 * This wraps every attempt in an external Promise.race so it can NEVER
 * hang past (options.timeout + 10s), and on failure it closes the
 * possibly-dead page and opens a fresh one for the next attempt rather
 * than reusing a tab that likely won't recover.
 *
 * Returns the page to use going forward — reassign it at the call site,
 * since a wedged page may have been replaced with a new one.
 */
async function safeNavigateWithRetry(page, url, options, retries = 3) {
    let currentPage = page;
    const hardTimeoutMs = (options.timeout || 20000) + 10000;

    for (let i = 0; i < retries; i++) {
        try {
            await Promise.race([
                currentPage.goto(url, options),
                new Promise((_, reject) => setTimeout(() => reject(new Error('HARD_TIMEOUT: navigation did not resolve within the external safety limit')), hardTimeoutMs))
            ]);
            return currentPage; // success — hand back the page actually used
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            console.log(`⚠️ Network retry trigger active (${i + 1}/${retries}). Re-attempting connection... (${error.message})`);

            if (isLastAttempt) {
                try { await Promise.race([currentPage.close(), new Promise(r => setTimeout(r, 5000))]); } catch (e) { /* best effort */ }
                throw new Error(`[FATAL DESTINATION FAILURE] Node dropped after ${retries} attempts: ${error.message}`);
            }

            // Replace the page rather than retrying on a tab that's likely wedged
            try {
                await Promise.race([currentPage.close(), new Promise(r => setTimeout(r, 5000))]);
            } catch (closeErr) { /* the old page may already be dead — proceed anyway */ }

            const browser = currentPage.browser();
            currentPage = await browser.newPage();
            await currentPage.setUserAgent(MODERN_USER_AGENT);

            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

/**
 * Dismisses Google's cookie/consent interstitial if it appears.
 * This is the #1 cause of "empty results" when running headless on a server.
 */
async function dismissConsentIfPresent(page) {
    try {
        const consentButtonSelectors = [
            'button[aria-label="Accept all"]',
            'form[action*="consent"] button',
            'button:has-text("Accept all")',
        ];
        for (const sel of consentButtonSelectors) {
            const btn = await page.$(sel).catch(() => null);
            if (btn) {
                await btn.click();
                await new Promise(r => setTimeout(r, 1500));
                console.log('✅ Dismissed consent interstitial.');
                return;
            }
        }
        // Fallback: click any button whose text looks like an accept action
        const clicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const target = buttons.find(b => /accept all|i agree/i.test(b.textContent || ''));
            if (target) { target.click(); return true; }
            return false;
        });
        if (clicked) {
            await new Promise(r => setTimeout(r, 1500));
            console.log('✅ Dismissed consent interstitial (text match).');
        }
    } catch (e) {
        // Non-fatal — page may simply not have shown a consent wall
    }
}

/**
 * Fallback contact lookup against a public business directory (no login required).
 * Note: directory site markup changes over time just like Maps — if this stops
 * matching, inspect the live DOM and update the selectors below.
 */
async function searchDirectoryFallback(browser, businessName, locationHint) {
    let page = await browser.newPage();
    try {
        await page.setUserAgent(MODERN_USER_AGENT);
        const searchUrl = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(businessName)}&geo_location_terms=${encodeURIComponent(locationHint || '')}`;
        page = await safeNavigateWithRetry(page, searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const detailHref = await page.evaluate(() => {
            const result = document.querySelector('.result .business-name');
            return result ? result.getAttribute('href') : null;
        });

        if (!detailHref) return null;

        const detailUrl = detailHref.startsWith('http') ? detailHref : `https://www.yellowpages.com${detailHref}`;
        page = await safeNavigateWithRetry(page, detailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const email = await page.evaluate(() => {
            const mailtoAnchor = document.querySelector('a[href^="mailto:"]');
            if (mailtoAnchor) return mailtoAnchor.getAttribute('href').replace(/mailto:/i, '').split('?')[0].trim();

            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const matches = document.body.innerText.match(emailRegex);
            return matches ? matches[0] : null;
        });

        return email;
    } catch (e) {
        return null;
    } finally {
        await page.close().catch(() => {}); // page may already be closed by safeNavigateWithRetry's own cleanup
    }
}

/**
 * Visits a place's own Maps detail page to resolve the canonical GBP URL
 * and the official website link Google itself associates with the listing.
 * List-card values for these are frequently missing or session-scoped —
 * the detail page is the authoritative source for both.
 */
async function getPlaceDetails(browser, gbpMapUrl) {
    let page = await browser.newPage();
    try {
        await page.setUserAgent(MODERN_USER_AGENT);
        const fullUrl = gbpMapUrl.startsWith('http') ? gbpMapUrl : `https://www.google.com${gbpMapUrl}`;
        page = await safeNavigateWithRetry(page, fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Give the detail panel a moment to render before reading it
        await page.waitForSelector('div[role="main"]', { timeout: 8000 }).catch(() => null);
        await new Promise(r => setTimeout(r, 1200)); // settle buffer for late-rendering action buttons

        const details = await page.evaluate(() => {
            // data-item-id="authority" is fragile and drifts with Google's markup updates.
            // The reliable signal is simpler: an <a> whose href points to a real external
            // domain (not a google.com/maps/gstatic link). Try the known attribute first,
            // then fall back to scanning all links on the page.
            const isExternalWebsiteLink = (a) => {
                const href = a.getAttribute('href') || '';
                if (!href.startsWith('http')) return false;
                if (href.includes('google.com') || href.includes('gstatic.com')) return false;
                return true;
            };

            let websiteEl = document.querySelector('a[data-item-id="authority"]');
            if (!websiteEl || !isExternalWebsiteLink(websiteEl)) {
                const candidates = Array.from(document.querySelectorAll('a[href^="http"]'));
                websiteEl = candidates.find(a => {
                    if (!isExternalWebsiteLink(a)) return false;
                    const label = (a.getAttribute('aria-label') || a.textContent || '').toLowerCase();
                    return label.includes('website') || label.includes('site');
                }) || candidates.find(isExternalWebsiteLink) || null;
            }

            const phoneEl = document.querySelector('button[data-item-id^="phone"]');
            const phoneLabel = phoneEl ? (phoneEl.getAttribute('aria-label') || phoneEl.textContent || '').replace(/^Phone:\s*/i, '').trim() : null;

            return {
                website: websiteEl ? websiteEl.getAttribute('href') : null,
                phone: phoneLabel || null,
            };
        });

        // page.url() after navigation is the canonical, stable GBP URL —
        // unlike the search-result href, it won't expire with the session.
        return { gbp_url: page.url(), website: details.website, phone: details.phone };
    } catch (e) {
        return { gbp_url: gbpMapUrl, website: null, phone: null };
    } finally {
        await page.close().catch(() => {});
    }
}

/**
 * Extracts a contact email from the currently loaded page. Checks, in order:
 * direct mailto links, Cloudflare-obfuscated emails (a very common anti-scraping
 * measure that a plain mailto/regex check silently misses), and finally a
 * regex sweep of the full HTML rather than just visible text.
 *
 * The Cloudflare decoder is a simple, publicly documented single-byte XOR
 * cipher — it's undoing obfuscation of data the site already serves to
 * every visitor's browser, not bypassing any actual security control.
 */
async function extractEmailFromCurrentPage(page) {
    return await page.evaluate(() => {
        const decodeCfEmail = (encoded) => {
            let email = '';
            const key = parseInt(encoded.substr(0, 2), 16);
            for (let i = 2; i < encoded.length; i += 2) {
                const charCode = parseInt(encoded.substr(i, 2), 16) ^ key;
                email += String.fromCharCode(charCode);
            }
            return email;
        };

        // 1. Direct mailto anchors
        const mailtoAnchors = document.querySelectorAll('a[href^="mailto:"]');
        for (const anchor of mailtoAnchors) {
            const clean = anchor.getAttribute('href').replace(/mailto:/i, '').split('?')[0].trim();
            if (clean) return clean;
        }

        // 2. Cloudflare-obfuscated emails — extremely common on small
        // business sites, and invisible to a plain mailto/regex check
        const cfProtected = document.querySelectorAll('[data-cfemail]');
        for (const el of cfProtected) {
            try {
                const decoded = decodeCfEmail(el.getAttribute('data-cfemail'));
                if (decoded && decoded.includes('@')) return decoded;
            } catch (e) { /* malformed hash, skip */ }
        }

        // 3. Regex across the full HTML (not just visible innerText) —
        // catches emails sitting in footers, comments, or elements hidden
        // by CSS that innerText would skip
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const htmlMatches = document.documentElement.innerHTML.match(emailRegex);
        if (htmlMatches) {
            const filtered = htmlMatches.filter(e =>
                !/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(e) &&
                !e.includes('sentry') && !e.includes('example.com') && !e.includes('wixpress')
            );
            if (filtered.length > 0) return filtered[0];
        }

        return null;
    });
}

/**
 * Tries the homepage first, then falls through common contact-page paths
 * if nothing is found there. Most small business sites keep the actual
 * email off the homepage entirely.
 */
async function findEmailOnWebsite(browser, websiteUrl) {
    let contactPage = await browser.newPage();
    try {
        await contactPage.setUserAgent(MODERN_USER_AGENT);

        // networkidle2 (not domcontentloaded) — footers with contact info
        // are frequently injected by JS after the initial DOM parse
        contactPage = await safeNavigateWithRetry(contactPage, websiteUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 800));

        let email = await extractEmailFromCurrentPage(contactPage);
        if (email) return email;

        const base = websiteUrl.replace(/\/$/, '');
        const candidatePaths = ['/contact', '/contact-us', '/contactus', '/pages/contact', '/about/contact', '/contact.html'];

        for (const path of candidatePaths) {
            try {
                contactPage = await safeNavigateWithRetry(contactPage, base + path, { waitUntil: 'domcontentloaded', timeout: 12000 });
                await new Promise(r => setTimeout(r, 600));
                email = await extractEmailFromCurrentPage(contactPage);
                if (email) return email;
            } catch (e) {
                continue; // path likely 404s — try the next candidate
            }
        }

        return null;
    } catch (e) {
        return null;
    } finally {
        await contactPage.close().catch(() => {});
    }
}

async function scrapeGoogleMapsUnlimited(searchQuery, targetWebhookUrl) {
    console.log(`📡 INITIALISING ENTERPRISE PUPPETEER CRAWL FOR: [${searchQuery}]`);
    // Used as the geo hint for the directory fallback, e.g. "Houston TX" from "HVAC Equipment Distributors in Houston TX"
    const locationHint = searchQuery.includes(' in ') ? searchQuery.split(' in ').pop() : '';

    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new", // "new" headless is far less likely to be flagged than the legacy true/false mode
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-dev-shm-usage' // critical on VPS/Docker: default /dev/shm (often 64MB) causes
                                      // Chrome to hang or crash silently under memory pressure otherwise
        ]
    });
    console.log('✅ Browser launched successfully.');

    try {
        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(30000); // safety net in case any goto() call is ever missing an explicit timeout
        await page.setUserAgent(MODERN_USER_AGENT);
        await page.setViewport({ width: 1280, height: 900 });

        // Force English UI so our class/text-based selectors stay predictable
        const searchUrl = "https://www.google.com/maps/search/" + encodeURIComponent(searchQuery) + "?hl=en";
        page = await safeNavigateWithRetry(page, searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        await dismissConsentIfPresent(page);

        // Wait explicitly for the results feed instead of assuming it's already there.
        // If this throws, we log diagnostics instead of silently returning nothing.
        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
        } catch (e) {
            const title = await page.title().catch(() => 'unknown');
            const url = page.url();
            console.log(`❌ Results feed never appeared. Page title: "${title}" | URL: ${url}`);
            console.log(`   This usually means Google served a consent page, CAPTCHA, or "no results" state.`);
            await browser.close();
            return;
        }

        let previousCount = 0;
        let currentCount = 0;
        let sameCountCycles = 0;

        while (sameCountCycles < 10) {
            try {
                await page.evaluate(() => {
                    const scrollPanel = document.querySelector('div[role="feed"]');
                    if (scrollPanel) scrollPanel.scrollTo(0, scrollPanel.scrollHeight);
                });
                await new Promise(resolve => setTimeout(resolve, 2500));

                currentCount = await page.evaluate(() => document.querySelectorAll('div.Nv2PK').length);
                console.log(`⏳ Map List Density: Rendered ${currentCount} business nodes...`);

                if (currentCount === previousCount) {
                    sameCountCycles++;
                } else {
                    sameCountCycles = 0;
                }

                if (currentCount >= 50) break;
                previousCount = currentCount;
            } catch (scrollError) {
                console.log(`⚠️ Scroll loop stopped early: ${scrollError.message}`);
                break;
            }
        }

        // FIX: only require name + place link at the list-card level.
        // The website link is frequently absent from the card and needs
        // to be picked up from the detail panel instead — requiring it
        // up front was silently discarding almost every listing.
        const listingsData = await page.evaluate(() => {
            const records = [];
            const uniquePlaces = new Set();

            const cards = document.querySelectorAll('div.Nv2PK');

            cards.forEach(card => {
                const linkEl = card.querySelector('a[href*="/maps/place/"]');
                const nameEl = card.querySelector('.qBF1Pd') || card.querySelector('.fontHeadlineSmall');

                const isExternalWebsiteLink = (a) => {
                    const href = a.getAttribute('href') || '';
                    if (!href.startsWith('http')) return false;
                    if (href.includes('google.com') || href.includes('gstatic.com')) return false;
                    return true;
                };
                let websiteEl = card.querySelector('a[data-item-id="authority"]');
                if (!websiteEl || !isExternalWebsiteLink(websiteEl)) {
                    const candidates = Array.from(card.querySelectorAll('a[href^="http"]'));
                    websiteEl = candidates.find(a => {
                        if (!isExternalWebsiteLink(a)) return false;
                        const label = (a.getAttribute('aria-label') || a.textContent || '').toLowerCase();
                        return label.includes('website') || label.includes('site');
                    }) || candidates.find(isExternalWebsiteLink) || null;
                }

                const phoneEl = card.querySelector('button[data-item-id^="phone"]') ||
                                card.querySelector('span.UsdlK');

                if (linkEl && nameEl) {
                    const nameText = nameEl.textContent.trim();
                    const gbpMapUrl = linkEl.getAttribute('href');
                    const siteUrl = websiteEl ? websiteEl.getAttribute('href') : null;
                    const phoneText = phoneEl ? phoneEl.textContent.trim() : null;

                    if (!uniquePlaces.has(nameText)) {
                        uniquePlaces.add(nameText);
                        records.push({ name: nameText, website: siteUrl, gbp_link: gbpMapUrl, phone: phoneText });
                    }
                }
            });
            return records;
        });

        console.log(`\n✅ Extraction Complete. Isolated ${listingsData.length} business profiles (${listingsData.filter(r => r.website).length} with a direct website link).`);

        if (listingsData.length === 0) {
            console.log('❌ Zero listings parsed even though the feed loaded — the card selector (div.Nv2PK) likely changed. Inspect the live DOM to confirm.');
        }

        for (let record of listingsData) {
            touchWatchdog(); // starting a new lead — proves the loop is still moving

            // Resolve the canonical GBP URL and official website from the place's
            // own detail page before deciding how to find a contact email.
            console.log(`\n📍 Resolving place details for [${record.name}]...`);
            const details = await getPlaceDetails(browser, record.gbp_link);
            record.gbp_link = details.gbp_url || record.gbp_link;
            record.website = record.website || details.website;
            record.phone = record.phone || details.phone;
            touchWatchdog(); // getPlaceDetails completed

            let targetEmail = null;
            let contactSource = null;

            if (record.website) {
                console.log(`\n🔎 Scanning website architecture for contact endpoints: ${record.website}`);
                try {
                    targetEmail = await findEmailOnWebsite(browser, record.website);
                    if (targetEmail) contactSource = 'website';
                } catch (pageError) {
                    console.log(`⚠️ Navigation skipped for [${record.name}] due to domain connection timeout error.`);
                }
            }

            if (!targetEmail) {
                console.log(`↪️  No email via website for [${record.name}] — checking public directory listing...`);
                const directoryEmail = await searchDirectoryFallback(browser, record.name, locationHint);
                if (directoryEmail) {
                    targetEmail = directoryEmail;
                    contactSource = 'directory';
                    console.log(`✅ Directory fallback found an email for [${record.name}].`);
                }
                await new Promise(resolve => setTimeout(resolve, 1500)); // pacing between directory requests
            }

            if (!targetEmail && record.phone) {
                contactSource = 'maps-phone-only';
                console.log(`📞 No email found anywhere for [${record.name}] — falling back to phone from Maps listing.`);
            }

            if (!targetEmail && !record.phone) {
                console.log(`⏭️  Skipping [${record.name}] — no email or phone found via website, directory, or Maps listing.`);
                continue;
            }

            const payload = {
                organization_name: record.name,
                operational_email: targetEmail ? targetEmail.toString().toLowerCase().trim() : null,
                phone: record.phone || null,
                contact_source: contactSource,
                website_url: record.website,
                gbp_url: record.gbp_link
            };

            try {
                const response = await axios.post(targetWebhookUrl, payload, { headers: { 'Content-Type': 'application/json' } });
                if (response.status === 200) {
                    console.log(`✉️ Pipeline Cleared: Lead [${record.name}] pushed to sheet (source: ${contactSource}).`);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (apiError) {
                console.log(`❌ Target connection drop or duplication skip for [${record.name}]`);
            }
        }
    } finally {
        await browser.close();
        console.log(`🏁 Outreach Sequence for [${searchQuery}] Concluded.\n`);
    }
}

// ====================================================================
// INACTIVITY WATCHDOG — fires only when there's been NO progress for a
// stretch, rather than capping total runtime. A full run doing real work
// (dozens of leads, each needing several page loads across getPlaceDetails,
// the website email scan, and the directory fallback) can legitimately take
// well over 20 minutes. What actually signals a hang is silence, not runtime.
// ====================================================================
const INACTIVITY_LIMIT_MS = 8 * 60 * 1000; // no progress for 8 min => assume a genuine hang
let lastProgressAt = Date.now();
function touchWatchdog() { lastProgressAt = Date.now(); }

function startWatchdog() {
    const interval = setInterval(() => {
        const idleForMs = Date.now() - lastProgressAt;
        if (idleForMs > INACTIVITY_LIMIT_MS) {
            console.error(`\n🛑 WATCHDOG TRIGGERED: no progress for ${Math.round(idleForMs / 60000)} minutes.`);
            console.error('   This means the browser process is genuinely stuck — check /dev/shm size,');
            console.error('   Chromium system dependencies, and outbound network access on this machine.');
            process.exit(1);
        }
    }, 30000);
    interval.unref(); // don't let the watchdog itself keep the process alive once real work finishes
    return interval;
}

async function main() {
    const watchdog = startWatchdog();

    // Load the persisted per-asset city cursor so this run picks up exactly
    // where the last run left off, rather than randomly re-rolling a city.
    const state = loadState();

    const nichesAsset1 = [
        "Industrial Supply Distributors",
        "Wholesale Plumbing Supplies",
        "Electrical Wholesalers",
        "HVAC Equipment Distributors",
        "Logistics & Warehousing Companies"
    ];
    const hubAsset1 = getNextHub(state, 'asset1');
    const query1 = nichesAsset1[Math.floor(Math.random() * nichesAsset1.length)] + " in " + hubAsset1;

    const nichesAsset2 = ["Independent Insurance Agencies", "Life Insurance Brokers", "Health Insurance Distributors", "Auto Insurance Agents"];
    const hubAsset2 = getNextHub(state, 'asset2');
    const query2 = nichesAsset2[Math.floor(Math.random() * nichesAsset2.length)] + " in " + hubAsset2;

    const nichesAsset3 = [
        "Industrial Supply Warehouses",
        "3PL Logistics Providers",
        "Freight & Trucking Terminals",
        "Distribution Centers",
        "Industrial Parks & Business Hubs"
    ];
    const hubAsset3 = getNextHub(state, 'asset3');
    const query3 = nichesAsset3[Math.floor(Math.random() * nichesAsset3.length)] + " in " + hubAsset3;

    // Persist the advanced cursor immediately — before scraping starts —
    // so a crash mid-run doesn't leave the cursor stuck repeating the same city.
    saveState(state);

    console.log(`🗺️  Asset 1 (Industrial/Distribution) → ${query1}  [hub ${(state.asset1 - 1 + US_METRO_HUBS.length) % US_METRO_HUBS.length + 1}/${US_METRO_HUBS.length}]`);
    console.log(`🗺️  Asset 2 (Insurance) → ${query2}  [hub ${(state.asset2 - 1 + US_METRO_HUBS.length) % US_METRO_HUBS.length + 1}/${US_METRO_HUBS.length}]`);
    console.log(`🗺️  Asset 3 (Industrial Supplies & Logistics Hubs) → ${query3}  [hub ${(state.asset3 - 1 + US_METRO_HUBS.length) % US_METRO_HUBS.length + 1}/${US_METRO_HUBS.length}]`);

    console.log('\n⚡ Running all three asset searches in parallel — each gets its own browser instance.');
    console.log('   Note: three simultaneous Chrome instances is meaningfully heavier on RAM/CPU than two.');
    console.log('   If hangs reappear, check memory headroom (`free -h`) before assuming it\'s a code bug.');

    // allSettled (not Promise.all) so a failure in one asset's run doesn't
    // cancel or hide the outcome of the others — you'll see all three results.
    const results = await Promise.allSettled([
        scrapeGoogleMapsUnlimited(query1, ASSET_1_SHEET_API),
        scrapeGoogleMapsUnlimited(query2, ASSET_2_SHEET_API),
        scrapeGoogleMapsUnlimited(query3, ASSET_3_SHEET_API)
    ]);

    const labels = ['Asset 1 (Industrial/Distribution)', 'Asset 2 (Insurance)', 'Asset 3 (Industrial Supplies & Logistics Hubs)'];
    results.forEach((result, i) => {
        if (result.status === 'rejected') {
            console.error(`❌ ${labels[i]} run failed: ${result.reason?.message || result.reason}`);
        } else {
            console.log(`✅ ${labels[i]} run completed.`);
        }
    });

    clearInterval(watchdog);
}

main();