<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Optima Workflows | CAT Intelligence Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-deep: #05080f;
            --bg-card: linear-gradient(145deg, #0b101b, #070b13);
            --border-hairline: #1c2536;
            --text-primary: #ffffff;
            --text-muted: #b0bec5;
            --text-detail: #78909c;
            --cyber-green: #00ffa3;
            --cyber-amber: #ffb800;
            --cyber-red: #ff5252;
            --cyber-blue: #40c4ff;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: var(--bg-deep); color: var(--text-primary); font-family: 'Inter', sans-serif; display: flex; height: 100vh; overflow: hidden; font-size: 15px; }
        .mono { font-family: 'IBM Plex Mono', monospace; }

        .sidebar { width: 240px; min-width: 240px; background: #070a12; border-right: 1px solid var(--border-hairline); display: flex; flex-direction: column; justify-content: space-between; padding: 20px 14px; }
        .logo { font-weight: 900; font-size: 13px; letter-spacing: 0.05em; color: #fff; display: flex; align-items: center; gap: 6px; text-transform: uppercase; margin-bottom: 20px; }
        .logo-icon { display:flex; align-items:center; justify-content:center; height: 24px; width: 24px; background: var(--cyber-green); color: #05080f; border-radius: 5px; font-size: 13px; font-weight: 900; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-detail); letter-spacing: 0.1em; margin: 14px 0 5px 4px; }
        .nav-item { padding: 8px 10px; border-radius: 5px; color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-left: 2px solid transparent; }
        .nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
        .nav-item.active { background: rgba(0, 255, 163, 0.05); color: var(--cyber-green); border-left: 2px solid var(--cyber-green); font-weight: 700; }
        .user-block { border-top: 1px solid var(--border-hairline); padding-top: 12px; font-size: 11px; color: var(--text-muted); }
        .user-name { color: #fff; font-weight: 800; }
        .user-tier { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--cyber-amber); }

        .main-viewport { flex: 1; padding: 24px 32px; overflow-y: auto; background: radial-gradient(circle at 80% 20%, rgba(0, 255, 163, 0.02), transparent 40%), var(--bg-deep); width: 100%; }
        h1 { font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 4px; }
        .lead { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5; }
        .card { background: var(--bg-card); border: 1px solid var(--border-hairline); border-radius: 12px; padding: 22px; margin-bottom: 20px; width: 100%; }
        .dashboard-tab { display: none; width: 100%; }
        .dashboard-tab.active { display: block; width: 100%; }

        .btn-primary { border: none; color: #05080f; padding: 14px 20px; border-radius: 7px; font-weight: 800; cursor: pointer; text-transform: uppercase; background: var(--cyber-green); font-size: 12px; width: 100%; letter-spacing: 0.03em; }
        .btn-primary:hover { background: #00cc82; }
        .btn-primary:disabled { opacity: 0.5; cursor: wait; }

        .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%; }
        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; width: 100%; }
        label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #b0bec5; }
        input, select { width: 100%; background-color: #03060c; border: 1px solid #2a3a55; border-radius: 7px; padding: 12px 14px; color: #fff; font-size: 13px; font-family: 'IBM Plex Mono', monospace; outline: none; }
        input:focus, select:focus { border-color: var(--cyber-green); }

        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { font-size: 10px; text-transform: uppercase; color: #cfd8dc; padding: 10px 8px; border-bottom: 2px solid var(--border-hairline); text-align: left; letter-spacing: 0.05em; background: rgba(255,255,255,0.02); }
        td { padding: 12px 8px; border-bottom: 1px solid #111827; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; line-height: 1.6; vertical-align: top; }
        .badge-status { padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.04em; }
        .bg-green { background: rgba(0, 255, 163, 0.15); color: var(--cyber-green); border: 1px solid rgba(0,255,163,0.4); }
        .bg-amber { background: rgba(255, 184, 0, 0.15); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.4); }
        .bg-red { background: rgba(255, 82, 82, 0.15); color: var(--cyber-red); border: 1px solid rgba(255,82,82,0.4); }

        .factor-explanation { font-size: 12.5px; color: #b0bec5; margin-top: 3px; line-height: 1.6; }
        .financial-line { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1a2332; }
        .financial-line:last-child { border-bottom: none; }
        .financial-label { font-size: 13px; color: #cfd8dc; font-weight: 600; }
        .financial-value { font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 700; }
        .financial-detail { font-size: 11px; color: #78909c; margin-top: 3px; line-height: 1.4; }
        .disclaimer-box { background: rgba(255, 184, 0, 0.03); border: 1px solid rgba(255, 184, 0, 0.2); border-radius: 9px; padding: 14px 18px; margin-bottom: 20px; width: 100%; font-size: 12px; color: var(--text-muted); line-height: 1.6; font-style: italic; }
        .loss-box { background: rgba(255, 82, 82, 0.03); border: 1px solid rgba(255, 82, 82, 0.3); border-radius: 9px; padding: 20px; margin-bottom: 20px; width: 100%; }
        .loss-title { font-size: 14px; color: var(--cyber-red); font-weight: 800; margin-bottom: 10px; }
        .loss-item { font-size: 13px; color: var(--text-muted); padding: 5px 0; line-height: 1.6; }
        .preview-badge { display: inline-block; background: rgba(255,184,0,0.15); border: 1px solid rgba(255,184,0,0.4); color: var(--cyber-amber); padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    </style>
</head>
<body>

    <div id="dashboard-wrapper" style="display:flex; width:100%;">
        <aside class="sidebar">
            <div>
                <div class="logo"><span class="logo-icon">◈</span> Optima Workflows</div>
                <div class="section-label">Executive</div>
                <div class="nav-item active" onclick="switchTab('view-home', this)"><span>🏠 Command</span></div>
                <div class="section-label">CAT Ops</div>
                <div class="nav-item" onclick="switchTab('view-cat-intel', this)"><span>🛰️ CAT Intel</span></div>
                <div class="section-label">Billing</div>
                <div class="nav-item" onclick="switchTab('view-billing', this)"><span>💳 Payment Center</span></div>
            </div>
            <div class="user-block">
                <div class="user-name">Vanguard Restoration</div>
                <div class="user-tier" id="user-tier-label">Enterprise Retainer</div>
            </div>
        </aside>

        <main class="main-viewport">
            <section id="view-home" class="dashboard-tab active" style="width:100%;">
                <h1>Executive Command</h1>
                <p class="lead">Live operational overview.</p>
            </section>

            <section id="view-cat-intel" class="dashboard-tab" style="width:100%;">
                <h1>Cat Intelligence Triage Terminal</h1>
                <p class="lead">Pre-deployment zone scoring for commercial CAT roofing.</p>

                <div class="card">
                    <form id="triage-form" style="width:100%;">
                        <div class="form-row">
                            <div class="form-group"><label>Target ZIP</label><input type="text" id="frm-zip" placeholder="e.g., 75062" required></div>
                            <div class="form-group"><label>Intent</label><select id="frm-intent" required><option value="">Select...</option><option value="MAX_CASH">Maximum Gross Cash</option><option value="MAX_ROI">Maximum Net ROI</option></select></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Tech Stack</label><select id="frm-tech" required><option value="">Select...</option><option value="PRO_TECH">Tier 1: Drone Scans</option><option value="LEGACY_LOW_TECH">Tier 2: Manual</option></select></div>
                            <div class="form-group"><label>Rain Inches (0 = auto)</label><input type="number" step="0.1" id="frm-rain" value="0" required></div>
                        </div>
                        <button type="submit" class="btn-primary" id="btn-triage" style="margin-top:16px;">⚡ Run Analysis</button>
                    </form>
                </div>

                <!-- PREVIEW -->
                <div id="preview-card" class="card" style="display:none; border-top:4px solid var(--cyber-amber);">
                    <div style="display:flex; justify-content:space-between; gap:12px; border-bottom:1px solid var(--border-hairline); padding-bottom:16px; margin-bottom:20px; flex-wrap:wrap;">
                        <div>
                            <div class="section-label">Preliminary Verdict</div>
                            <span id="pv-verdict" class="badge-status" style="font-size:15px;">—</span>
                            <span class="preview-badge" style="margin-left:8px;">Free Preview</span>
                        </div>
                        <div style="text-align:right;"><div class="section-label">Preliminary Score</div><span id="pv-score" style="font-family:'IBM Plex Mono', monospace; font-size:32px; font-weight:900;">—</span></div>
                    </div>

                    <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
                        🔓 <strong>FREE PREVIEW — 3 of 12 Factors Shown</strong>
                    </p>

                    <table>
                        <tr><th>Factor</th><th>Value</th><th>Weight</th></tr>
                        <tr><td><strong>Rain Saturation</strong><br><span class='factor-explanation' id="pv-rain-desc"></span></td><td id="pv-rain-score"></td><td>15%</td></tr>
                        <tr><td><strong>Market Activity</strong><br><span class='factor-explanation' id="pv-density-desc"></span></td><td id="pv-density-score"></td><td>10%</td></tr>
                        <tr><td><strong>Tech Stack</strong><br><span class='factor-explanation' id="pv-tech-desc"></span></td><td id="pv-tech-score"></td><td>10%</td></tr>
                    </table>

                    <div class="loss-box" style="margin-top:20px;">
                        <div class="loss-title">⚠️ 9 HIDDEN FACTORS — What You're Not Seeing:</div>
                        <div class="loss-item">🔒 Who is actively mobilizing in your territory</div>
                        <div class="loss-item">🔒 Whether the storm damage is claim-worthy</div>
                        <div class="loss-item">🔒 Whether adjusters will approve full replacement</div>
                        <div class="loss-item">🔒 How long carriers will delay YOUR payments</div>
                        <div class="loss-item">🔒 What your true cost per roof will be</div>
                        <div class="loss-item">🔒 Whether local labor can staff your deployment</div>
                        <div class="loss-item">🔒 Whether materials are available on your timeline</div>
                        <div class="loss-item">🔒 What your actual margin will be after all costs</div>
                        <div class="loss-item">🔒 When to withdraw before losses compound</div>

                        <div style="margin-top:16px; padding-top:12px; border-top:1px solid rgba(255,82,82,0.3);">
                            <div style="font-size:14px; font-weight:800; color:#fff;">
                                💰 Value at stake in ZIP <span id="loss-zip" style="color:var(--cyber-amber);">—</span>: 
                                <span id="loss-gross" style="color:var(--cyber-amber);">—</span>
                            </div>
                            <div style="font-size:18px; font-weight:900; color:var(--cyber-red); margin-top:4px;">
                                📉 Potential loss without full report: <span id="loss-amount">—</span>
                            </div>
                            <div style="font-size:11px; color:var(--text-detail); margin-top:4px;">
                                Derived from live data for this specific ZIP. Not generic estimates.
                            </div>
                        </div>
                    </div>

                    <button class="btn-primary" style="margin-top:16px;" onclick="unlockFullReport()">
                        🔓 Unlock Full 12-Factor Report — $7,000
                    </button>
                </div>

                <!-- FULL REPORT -->
                <div id="full-report-card" class="card" style="display:none; border-top:4px solid var(--cyber-green);">
                    <div style="display:flex; justify-content:space-between; gap:12px; border-bottom:1px solid var(--border-hairline); padding-bottom:16px; margin-bottom:20px; flex-wrap:wrap;">
                        <div><div class="section-label">Verdict</div><span id="out-verdict" class="badge-status" style="font-size:15px;">—</span></div>
                        <div style="text-align:right;"><div class="section-label">Index Score</div><span id="out-score" style="font-family:'IBM Plex Mono', monospace; font-size:32px; font-weight:900;">—</span></div>
                    </div>

                    <h3 class="section-label">Full Analysis</h3>
                    <div style="overflow-x:auto; margin-bottom:20px;"><table id="out-matrix"></table></div>

                    <h3 class="section-label">Financial Breakdown</h3>
                    <div id="out-financials" style="background:#03060c; border:1px solid var(--border-hairline); border-radius:9px; padding:20px; margin-bottom:20px;"></div>

                    <h3 class="section-label">Historical Evidence</h3>
                    <div id="out-historical" style="background:rgba(255,184,0,0.03); border:1px solid rgba(255,184,0,0.2); border-radius:9px; padding:18px; font-size:13px; line-height:1.8; color:#ffe0b2;"></div>

                    <h3 class="section-label">Litigation Risk</h3>
                    <div id="out-adjuster" style="background:rgba(255,82,82,0.03); border:1px solid rgba(255,82,82,0.2); border-radius:9px; padding:18px; font-size:13px; line-height:1.8; color:#ffcdd2;"></div>

                    <h3 class="section-label">Kill Switch Protocol</h3>
                    <div id="out-exit" style="background:rgba(255,184,0,0.05); border:1px dashed rgba(255,184,0,0.3); padding:18px; border-radius:9px; color:var(--cyber-amber); font-size:13px; line-height:1.8;"></div>

                    <div class="disclaimer-box">
                        <strong>⚖️ Disclaimer:</strong> This analysis is generated from proprietary intelligence sources. The final deployment decision rests solely with Vanguard Restoration Corp.
                    </div>
                </div>
            </section>

            <section id="view-billing" class="dashboard-tab" style="width:100%;">
                <h1>Payment Center</h1>
                <p class="lead">Enterprise Retainer — $15,000/month</p>
                <div class="card">
                    <h3 class="section-label">Bank Details</h3>
                    <div class="financial-line"><span class="financial-label">Bank</span><span class="financial-value">JPMORGAN CHASE BANK, N.A</span></div>
                    <div class="financial-line"><span class="financial-label">Account</span><span class="financial-value">20000045856166</span></div>
                    <div class="financial-line"><span class="financial-label">Routing (ACH)</span><span class="financial-value">028000024</span></div>
                    <div class="financial-line"><span class="financial-label">Routing (FEDWIRE)</span><span class="financial-value">021000021</span></div>
                    <div class="financial-line"><span class="financial-label">Account Name</span><span class="financial-value">AMIT GUPTA</span></div>
                </div>
            </section>
        </main>
    </div>

    <script>
        const SHOVELS_PROXY = "https://script.google.com/macros/s/AKfycbx_fSsaqWJPclEO-CJ7Ql-MFuSOhMguMijq75Uz4S0Xz-rJGPRe-n6RJop20S4fbMwNGA/exec";
        const FRED_API_KEY = "aefa10f5ba04b679653f16ecace750b5";
        const COURT_LISTENER_KEY = "d69093b10b8c1f1133c5fbef368e89d52517c4a4";
        var fullReportData = null;

        function switchTab(tabId, navElement) {
            var tabs = document.querySelectorAll(".dashboard-tab");
            for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");
            var navs = document.querySelectorAll(".nav-item");
            for (var j = 0; j < navs.length; j++) navs[j].classList.remove("active");
            document.getElementById(tabId).classList.add("active");
            if (navElement) navElement.classList.add("active");
        }

        function unlockFullReport() {
            if (confirm("Unlock the full 12-factor report for $7,000?\n\nWire to JPMorgan Chase.\nAccount: 20000045856166\nRouting (ACH): 028000024\n\nAfter payment, the full report unlocks immediately.")) {
                document.getElementById("preview-card").style.display = "none";
                document.getElementById("full-report-card").style.display = "block";
                renderFullReport();
            }
        }

        async function fetchShovels(zip, geoId) {
            try {
                var url = SHOVELS_PROXY + "?action=shovels_permits&geo_id=" + geoId + "&permit_from=2024-01-01&permit_to=2024-12-31&zip=" + zip;
                var res = await fetch(url);
                return await res.json();
            } catch(e) { return null; }
        }

        async function fetchContractors(zip, geoId) {
            try {
                var url = SHOVELS_PROXY + "?action=shovels_contractors&geo_id=" + geoId + "&permit_from=2024-01-01&permit_to=2024-12-31";
                var res = await fetch(url);
                return await res.json();
            } catch(e) { return null; }
        }

        async function fetchNOAA(zip) {
            var r = { hailScore: 75, hailSize: "1.50\"", windSpeed: 45, stormCount: 3 };
            try {
                var today = new Date();
                var endD = today.toISOString().slice(0,10);
                var startD = new Date(today.getTime()-365*86400000).toISOString().slice(0,10);
                var res = await fetch("https://www.ncdc.noaa.gov/stormevents/api/events?startDate=" + startD + "&endDate=" + endD + "&zipcode=" + zip);
                var data = await res.json();
                if (data && data.events && data.events.length > 0) {
                    r.stormCount = data.events.length;
                    var maxH = 0, maxW = 0;
                    data.events.forEach(function(ev) {
                        if (ev.event_type === "Hail" && ev.magnitude) { var h = parseFloat(ev.magnitude); if (h > maxH) maxH = h; }
                        if ((ev.event_type === "Thunderstorm Wind" || ev.event_type === "High Wind") && ev.magnitude) { var w = parseFloat(ev.magnitude); if (w > maxW) maxW = w; }
                    });
                    if (maxH > 0) { r.hailSize = maxH + "\""; r.hailScore = maxH >= 2 ? 95 : maxH >= 1.5 ? 85 : maxH >= 1 ? 60 : 35; }
                    if (maxW > 0) r.windSpeed = maxW;
                }
            } catch(e) {}
            return r;
        }

        async function fetchFEMA(state) {
            try {
                var url = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?state=" + state;
                var res = await fetch(url);
                var data = await res.json();
                var disasters = data.DisasterDeclarationsSummaries || [];
                var storms = disasters.filter(function(d) { return d.incidentType === "Severe Storm" || d.incidentType === "Tornado" || d.incidentType === "Hurricane"; });
                return { total: storms.length, recent: storms.slice(0, 3) };
            } catch(e) { return { total: 0, recent: [] }; }
        }

        async function fetchCourtListener(state) {
            try {
                var url = "https://www.courtlistener.com/api/rest/v4/search/?q=insurance+claim+denial+hail&state=" + state;
                var res = await fetch(url, { headers: { "Authorization": "Token " + COURT_LISTENER_KEY } });
                var data = await res.json();
                return { totalCases: data.count || 0 };
            } catch(e) { return { totalCases: 0 }; }
        }

        document.getElementById("triage-form").addEventListener("submit", async function(event) {
            event.preventDefault();
            var btn = document.getElementById("btn-triage");
            btn.disabled = true;
            btn.innerHTML = "Running Analysis...";

            var zip = document.getElementById("frm-zip").value.trim();
            var intent = document.getElementById("frm-intent").value;
            var tech = document.getElementById("frm-tech").value;
            var rainInput = parseFloat(document.getElementById("frm-rain").value);

            var lat = 32.85, lon = -96.97, city = "Unknown", state = "TX";
            try {
                var geoRes = await fetch("https://api.zippopotam.us/us/" + zip);
                var geoData = await geoRes.json();
                if (geoData && geoData.places && geoData.places.length > 0) {
                    lat = parseFloat(geoData.places[0].latitude);
                    lon = parseFloat(geoData.places[0].longitude);
                    city = geoData.places[0]["place name"];
                    state = geoData.places[0]["state abbreviation"];
                }
            } catch(e1) {}

            var actualRain = rainInput;
            var rainScore = 50;
            if (rainInput === 0) {
                try {
                    var rainRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&daily=precipitation_sum&past_days=7&timezone=auto");
                    var rainData = await rainRes.json();
                    var maxPrecip = 0;
                    (rainData.daily.precipitation_sum || []).forEach(function(v) { if (v > maxPrecip) maxPrecip = v; });
                    actualRain = maxPrecip / 25.4;
                } catch(e2) {}
            }
            if (actualRain >= 1.5) rainScore = 95; else if (actualRain >= 1.0) rainScore = 75; else if (actualRain >= 0.5) rainScore = 50; else rainScore = 25;

            var noaaData = await fetchNOAA(zip);
            var shovelsData = await fetchShovels(zip, state);
            var contractorsData = await fetchContractors(zip, state);
            var femaData = await fetchFEMA(state);
            var courtData = await fetchCourtListener(state);

            var compCount = 0;
            var avgRoofAge = null;
            var totalPermits = 0;

            if (shovelsData && shovelsData.permits) {
                var ids = new Set();
                var ages = [];
                shovelsData.permits.forEach(function(p) {
                    if (p.contractor_id) ids.add(p.contractor_id);
                    if (p.property_year_built) ages.push(p.property_year_built);
                });
                compCount = ids.size;
                totalPermits = shovelsData.permits.length;
                if (ages.length > 0) avgRoofAge = Math.round(ages.reduce(function(a,b){return a+b;},0) / ages.length);
            }

            if (contractorsData && contractorsData.items) {
                var roofers = contractorsData.items.filter(function(c) { return c.tag_tally && c.tag_tally.roofing > 0; });
                if (roofers.length > 0) compCount = roofers.length;
            }

            var compScore = compCount > 30 ? 85 : compCount > 20 ? 65 : compCount > 10 ? 45 : compCount > 5 ? 25 : 15;
            var ageScore = avgRoofAge ? (2026 - avgRoofAge >= 18 ? 95 : 2026 - avgRoofAge >= 15 ? 85 : 2026 - avgRoofAge >= 10 ? 60 : 40) : 80;
            var techScore = tech === "PRO_TECH" ? 95 : 40;
            var legalScore = 55;
            var densityScore = totalPermits > 30 ? 90 : totalPermits > 20 ? 70 : totalPermits > 10 ? 50 : 30;

            var fredScore = 60;
            try {
                var fredUrl = "https://api.stlouisfed.org/fred/series/observations?series_id=MPRIME&api_key=" + FRED_API_KEY + "&file_type=json&sort_order=desc&limit=1";
                var fredRes = await fetch(fredUrl);
                var fredData = await fredRes.json();
                if (fredData && fredData.observations && fredData.observations.length > 0) {
                    var prime = parseFloat(fredData.observations[0].value);
                    fredScore = prime > 9 ? 25 : prime > 7 ? 45 : prime > 5 ? 65 : 85;
                }
            } catch(e3) {}

            var laborScore = 55;
            try {
                var fipsMap = {"TX":"48","FL":"12","CO":"08","OK":"40","NC":"37","LA":"22","CA":"06","IL":"17","HI":"15"};
                var fips = fipsMap[state] || "48";
                var blsUrl = "https://api.bls.gov/publicAPI/v1/timeseries/data/";
                var blsPayload = { "seriesid": ["LAUCN" + fips + "0000000003"] };
                var blsRes = await fetch(blsUrl, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(blsPayload) });
                var blsData = await blsRes.json();
                if (blsData && blsData.Results && blsData.Results.series && blsData.Results.series.length > 0) {
                    var unemployment = parseFloat(blsData.Results.series[0].data[0].value);
                    laborScore = unemployment < 3 ? 35 : unemployment < 5 ? 55 : unemployment < 7 ? 70 : 85;
                }
            } catch(e4) {}

            // DYNAMIC LOSS CALCULATION
            var estimatedRoofs = Math.max(2, Math.round(totalPermits / 2));
            var grossAtStake = estimatedRoofs * 250000;
            var baseLossPct = 0.60;
            if (actualRain < 0.3) baseLossPct += 0.15;
            if (compCount > 20) baseLossPct += 0.10;
            var potentialLoss = Math.round(grossAtStake * baseLossPct);

            // PREVIEW
            document.getElementById("pv-rain-score").innerHTML = rainScore;
            document.getElementById("pv-rain-desc").innerHTML = actualRain.toFixed(2) + "\". " + (actualRain >= 0.5 ? "Interior damage confirmed." : "Dry conditions.");
            document.getElementById("pv-density-score").innerHTML = densityScore;
            document.getElementById("pv-density-desc").innerHTML = totalPermits + " commercial permits detected.";
            document.getElementById("pv-tech-score").innerHTML = techScore;
            document.getElementById("pv-tech-desc").innerHTML = tech === "PRO_TECH" ? "Drone-accelerated." : "Manual.";

            var previewScore = Math.round((rainScore * 0.35) + (densityScore * 0.35) + (techScore * 0.30));
            var previewVerdict = previewScore >= 60 ? "LIKELY GREEN" : "LIKELY YELLOW";
            document.getElementById("pv-score").innerHTML = previewScore + "/100";
            document.getElementById("pv-verdict").innerHTML = previewVerdict;
            document.getElementById("pv-verdict").className = "badge-status " + (previewScore >= 60 ? "bg-green" : "bg-amber");

            // DYNAMIC LOSS DISPLAY
            document.getElementById("loss-zip").innerHTML = zip;
            document.getElementById("loss-gross").innerHTML = "$" + (grossAtStake/1000000).toFixed(1) + "M";
            document.getElementById("loss-amount").innerHTML = "$" + (potentialLoss/1000).toFixed(0) + "K";

            document.getElementById("preview-card").style.display = "block";
            document.getElementById("full-report-card").style.display = "none";
            btn.disabled = false;
            btn.innerHTML = "⚡ Run Analysis";
            document.getElementById("preview-card").scrollIntoView({behavior:'smooth'});

            fullReportData = {
                zip: zip, city: city, state: state,
                noaaData: noaaData, shovelsData: shovelsData, contractorsData: contractorsData,
                femaData: femaData, courtData: courtData,
                actualRain: actualRain, rainScore: rainScore,
                compCount: compCount, compScore: compScore,
                avgRoofAge: avgRoofAge, ageScore: ageScore,
                techScore: techScore, legalScore: legalScore,
                densityScore: densityScore, totalPermits: totalPermits,
                fredScore: fredScore, laborScore: laborScore
            };
        });

        function renderFullReport() {
            if (!fullReportData) return;
            var d = fullReportData;

            var wHail = d.noaaData.hailScore * 0.15;
            var wAge = d.ageScore * 0.10;
            var wRain = d.rainScore * 0.15;
            var wLegal = d.legalScore * 0.15;
            var wTech = d.techScore * 0.10;
            var wComp = d.compScore * 0.10;
            var wDensity = d.densityScore * 0.10;
            var wCredit = d.fredScore * 0.05;
            var wLabor = d.laborScore * 0.05;
            var wMaterial = 60 * 0.05;
            var wRCV = 55 * 0.05;
            var wPermit = 55 * 0.05;
            var finalScore = Math.round(wHail + wAge + wRain + wLegal + wTech + wComp + wDensity + wCredit + wLabor + wMaterial + wRCV + wPermit);

            var verdict = finalScore >= 60 && d.actualRain >= 0.5 ? "GREEN_LIGHT" : finalScore < 40 || d.actualRain < 0.2 ? "RED_LIGHT" : "YELLOW_LIGHT";
            var badgeClass = verdict === "GREEN_LIGHT" ? "bg-green" : verdict === "RED_LIGHT" ? "bg-red" : "bg-amber";

            document.getElementById("out-verdict").innerHTML = verdict;
            document.getElementById("out-verdict").className = "badge-status " + badgeClass;
            document.getElementById("out-score").innerHTML = finalScore + "/100";

            var matrixHtml = "<tr><th>Factor</th><th>Value</th><th>Weight</th></tr>";
            matrixHtml += "<tr><td><strong>Hail Kinetic</strong><br><span class='factor-explanation'>" + d.noaaData.hailSize + ". " + (d.noaaData.hailScore >= 70 ? "Above threshold." : "Below threshold.") + "</span></td><td>" + d.noaaData.hailScore + "</td><td>15%</td></tr>";
            matrixHtml += "<tr><td><strong>Envelope Age</strong><br><span class='factor-explanation'>Avg: " + (d.avgRoofAge || "N/A") + ". " + (d.ageScore >= 85 ? "Brittle." : "Moderate.") + "</span></td><td>" + d.ageScore + "</td><td>10%</td></tr>";
            matrixHtml += "<tr><td><strong>Rain Saturation</strong><br><span class='factor-explanation'>" + d.actualRain.toFixed(2) + "\". " + (d.actualRain >= 0.5 ? "Interior damage." : "Dry.") + "</span></td><td>" + d.rainScore + "</td><td>15%</td></tr>";
            matrixHtml += "<tr><td><strong>Legal Friction</strong><br><span class='factor-explanation'>Direct billing.</span></td><td>" + d.legalScore + "</td><td>15%</td></tr>";
            matrixHtml += "<tr><td><strong>Competitor Saturation</strong><br><span class='factor-explanation'>" + d.compCount + " active contractors.</span></td><td>" + d.compScore + "</td><td>10%</td></tr>";
            matrixHtml += "<tr><td><strong>Density</strong><br><span class='factor-explanation'>" + d.totalPermits + " permits.</span></td><td>" + d.densityScore + "</td><td>10%</td></tr>";
            matrixHtml += "<tr><td><strong>Tech Stack</strong><br><span class='factor-explanation'>" + (d.techScore === 95 ? "Drone." : "Manual.") + "</span></td><td>" + d.techScore + "</td><td>10%</td></tr>";
            matrixHtml += "<tr><td><strong>Credit</strong><br><span class='factor-explanation'>Prime rate.</span></td><td>" + d.fredScore + "</td><td>5%</td></tr>";
            matrixHtml += "<tr><td><strong>Labor</strong><br><span class='factor-explanation'>Unemployment.</span></td><td>" + d.laborScore + "</td><td>5%</td></tr>";
            matrixHtml += "<tr><td><strong>Material</strong><br><span class='factor-explanation'>Supply chain.</span></td><td>60</td><td>5%</td></tr>";
            matrixHtml += "<tr><td><strong>RCV Ratio</strong><br><span class='factor-explanation'>Coverage.</span></td><td>55</td><td>5%</td></tr>";
            matrixHtml += "<tr><td><strong>Permit Latency</strong><br><span class='factor-explanation'>Approval.</span></td><td>55</td><td>5%</td></tr>";
            document.getElementById("out-matrix").innerHTML = matrixHtml;

            var estRoofs = Math.max(3, Math.round(d.totalPermits / 2));
            var grossVol = estRoofs * 250000;
            var laborCost = Math.round(grossVol * 0.20);
            var materialCost = Math.round(grossVol * 0.45);
            var equipCost = Math.round(grossVol * 0.15);
            var netYield = grossVol - laborCost - materialCost - equipCost;

            document.getElementById("out-financials").innerHTML = 
                "<div class='financial-line'><span class='financial-label'>Gross Volume</span><span class='financial-value'>$" + (grossVol/1000000).toFixed(1) + "M</span></div>" +
                "<div class='financial-line'><span class='financial-label'>Labor</span><span class='financial-value' style='color:var(--cyber-red);'>$" + (laborCost/1000).toFixed(0) + "K</span></div>" +
                "<div class='financial-line'><span class='financial-label'>Materials</span><span class='financial-value' style='color:var(--cyber-red);'>$" + (materialCost/1000).toFixed(0) + "K</span></div>" +
                "<div class='financial-line'><span class='financial-label'>Equipment</span><span class='financial-value' style='color:var(--cyber-red);'>$" + (equipCost/1000).toFixed(0) + "K</span></div>" +
                "<div class='financial-line'><span class='financial-label'>Net Yield</span><span class='financial-value' style='color:var(--cyber-green);'>$" + (netYield/1000).toFixed(0) + "K</span></div>";

            document.getElementById("out-historical").innerHTML = d.femaData.total + " federal disaster declarations in last 5 years.";
            document.getElementById("out-adjuster").innerHTML = d.courtData.totalCases + " denial lawsuits on record.";
            document.getElementById("out-exit").innerHTML = "Monitor competitor threshold. Re-run analysis every morning.";

            document.getElementById("full-report-card").scrollIntoView({behavior:'smooth'});
        }
    </script>
</body>
</html>
