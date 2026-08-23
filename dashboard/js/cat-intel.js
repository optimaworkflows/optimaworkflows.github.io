function initModule(container, moduleKey) {
    container.innerHTML = `
        <h1>Cat Intelligence Triage Terminal</h1>
        <p class="lead">Pre-deployment zone scoring for commercial CAT roofing.</p>
        <div class="card">
            <form id="triage-form">
                <div class="form-row">
                    <div class="form-group"><label>Target ZIP</label><input type="text" id="frm-zip" placeholder="e.g., 75062" required></div>
                    <div class="form-group"><label>Intent</label><select id="frm-intent" required><option value="">Select...</option><option value="MAX_CASH">Maximum Gross Cash</option><option value="MAX_ROI">Maximum Net ROI</option></select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Tech Stack</label><select id="frm-tech" required><option value="">Select...</option><option value="PRO_TECH">Tier 1: Drone Scans</option><option value="LEGACY_LOW_TECH">Tier 2: Manual</option></select></div>
                    <div class="form-group"><label>Rain Inches (0 = auto)</label><input type="number" step="0.1" id="frm-rain" value="0" required></div>
                </div>
                <button type="submit" class="btn-primary" id="btn-triage">Run Analysis</button>
            </form>
        </div>
        <div id="results-card" class="card" style="display:none;"><div id="results-content"></div></div>
    `;
    document.getElementById("triage-form").addEventListener("submit", runTriage);
}

async function runTriage(event) {
    event.preventDefault();
    var btn = document.getElementById("btn-triage");
    btn.disabled = true;
    btn.innerHTML = "Processing...";
    
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
    if (rainInput === 0) {
        try {
            var rainRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&daily=precipitation_sum&past_days=7&timezone=auto");
            var rainData = await rainRes.json();
            var maxPrecip = 0;
            (rainData.daily.precipitation_sum || []).forEach(function(v) { if (v > maxPrecip) maxPrecip = v; });
            actualRain = maxPrecip / 25.4;
        } catch(e2) {}
    }
    
    var resultsHTML = `
        <h3 class="section-label">Analysis Results — ${city}, ${state} (${zip})</h3>
        <table>
            <tr><th>Factor</th><th>Value</th></tr>
            <tr><td>Rain Saturation</td><td>${actualRain.toFixed(2)}"</td></tr>
            <tr><td>Market Activity</td><td>Processing...</td></tr>
        </table>
        <div class="disclaimer-box" style="margin-top:20px;">
            <strong>⚖️ Disclaimer:</strong> Final decision rests with you.
        </div>
    `;
    
    document.getElementById("results-content").innerHTML = resultsHTML;
    document.getElementById("results-card").style.display = "block";
    btn.disabled = false;
    btn.innerHTML = "Run Analysis";
}
