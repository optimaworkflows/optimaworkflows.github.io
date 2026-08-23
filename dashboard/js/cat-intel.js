function initModule(container, moduleKey) {
    container.innerHTML = `
        <h1>Cat Intelligence Triage Terminal</h1>
        <p class="lead">Pre-deployment zone scoring for commercial CAT roofing.</p>
        
        <div class="card">
            <form id="triage-form">
                <h3 class="section-label">Storm Parameters</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Target ZIP</label>
                        <input type="text" id="frm-zip" placeholder="e.g., 75062" required>
                    </div>
                    <div class="form-group">
                        <label>Intent</label>
                        <select id="frm-intent" required>
                            <option value="">Select...</option>
                            <option value="MAX_CASH">Maximum Gross Cash</option>
                            <option value="MAX_ROI">Maximum Net ROI</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tech Stack</label>
                        <select id="frm-tech" required>
                            <option value="">Select...</option>
                            <option value="PRO_TECH">Tier 1: Drone Scans</option>
                            <option value="LEGACY_LOW_TECH">Tier 2: Manual</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Rain Inches (0 = auto)</label>
                        <input type="number" step="0.1" id="frm-rain" value="0" required>
                    </div>
                </div>
                <button type="submit" class="btn-primary" id="btn-triage">⚡ Execute Triage</button>
            </form>
        </div>
        
        <div id="results-card" class="card" style="display:none;">
            <div id="results-content"></div>
        </div>
    `;
    
    document.getElementById("triage-form").addEventListener("submit", handleTriage);
}

async function handleTriage(event) {
    event.preventDefault();
    // Triage logic here (from earlier work)
    alert("Triage engine would run here with Shovels.ai + NOAA + FRED data.");
}
