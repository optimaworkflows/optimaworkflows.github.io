// ============================================================
// STORM AUDIT MODULE — CUSTOM FORM + GOOGLE SHEETS
// ============================================================

function initModule(container, moduleKey) {
    container.innerHTML = `
        <h1>Storm Audit</h1>
        <p class="lead">Flat-fee Xactimate code review before claim submission. <strong>$3,500 per roof.</strong></p>
        
        <div class="card">
            <form id="storm-audit-form" onsubmit="event.preventDefault(); submitStormAudit();">
                
                <h3 class="section-label" style="margin-top:0;">Client Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Company Name *</label>
                        <input type="text" id="sa-company" required placeholder="e.g., Vanguard Restoration Corp">
                    </div>
                    <div class="form-group">
                        <label>Your Name *</label>
                        <input type="text" id="sa-name" required placeholder="e.g., John Smith">
                    </div>
                </div>
                <div class="form-group">
                    <label>Corporate Email Address *</label>
                    <input type="email" id="sa-email" required placeholder="operations@yourcompany.com">
                </div>
                
                <h3 class="section-label">Property Details</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Target Property State *</label>
                        <select id="sa-state" required>
                            <option value="">Select State...</option>
                            <option value="AL">Alabama</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            <option value="CA">California</option>
                            <option value="CO">Colorado</option>
                            <option value="CT">Connecticut</option>
                            <option value="DE">Delaware</option>
                            <option value="FL">Florida</option>
                            <option value="GA">Georgia</option>
                            <option value="HI">Hawaii</option>
                            <option value="ID">Idaho</option>
                            <option value="IL">Illinois</option>
                            <option value="IN">Indiana</option>
                            <option value="IA">Iowa</option>
                            <option value="KS">Kansas</option>
                            <option value="KY">Kentucky</option>
                            <option value="LA">Louisiana</option>
                            <option value="ME">Maine</option>
                            <option value="MD">Maryland</option>
                            <option value="MA">Massachusetts</option>
                            <option value="MI">Michigan</option>
                            <option value="MN">Minnesota</option>
                            <option value="MS">Mississippi</option>
                            <option value="MO">Missouri</option>
                            <option value="MT">Montana</option>
                            <option value="NE">Nebraska</option>
                            <option value="NV">Nevada</option>
                            <option value="NH">New Hampshire</option>
                            <option value="NJ">New Jersey</option>
                            <option value="NM">New Mexico</option>
                            <option value="NY">New York</option>
                            <option value="NC">North Carolina</option>
                            <option value="ND">North Dakota</option>
                            <option value="OH">Ohio</option>
                            <option value="OK">Oklahoma</option>
                            <option value="OR">Oregon</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="RI">Rhode Island</option>
                            <option value="SC">South Carolina</option>
                            <option value="SD">South Dakota</option>
                            <option value="TN">Tennessee</option>
                            <option value="TX">Texas</option>
                            <option value="UT">Utah</option>
                            <option value="VT">Vermont</option>
                            <option value="VA">Virginia</option>
                            <option value="WA">Washington</option>
                            <option value="WV">West Virginia</option>
                            <option value="WI">Wisconsin</option>
                            <option value="WY">Wyoming</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Local Municipality / City *</label>
                        <input type="text" id="sa-city" required placeholder="e.g., Irving">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>ZIP Code *</label>
                        <input type="text" id="sa-zip" required placeholder="e.g., 75062">
                    </div>
                    <div class="form-group">
                        <label>Claim / Reference Number (Optional)</label>
                        <input type="text" id="sa-claim" placeholder="e.g., CL-2024-001">
                    </div>
                </div>
                
                <h3 class="section-label">Scope Details</h3>
                <div class="form-group">
                    <label>Number of Structures Covered by This Scope (Optional)</label>
                    <input type="number" id="sa-structures" min="1" placeholder="e.g., 3">
                </div>
                <div class="form-group">
                    <label>Secure Scope Document Link *</label>
                    <input type="url" id="sa-doc-link" required placeholder="https://drive.google.com/your-file-link">
                </div>
                
                <h3 class="section-label">Confirmation</h3>
                <div class="form-group" style="display:flex; align-items:flex-start; gap:8px;">
                    <input type="checkbox" id="sa-confirm" required style="width:20px; height:20px; flex:0 0 20px; margin-top:2px;">
                    <label style="text-transform:none; font-weight:600; font-size:13px; letter-spacing:0;">I confirm I have the right to share this data and understand it will be used only to run this review. *</label>
                </div>
                
                <button type="submit" class="btn-primary" style="margin-top:16px;">🌪️ Submit Storm Audit Request</button>
            </form>
        </div>
        
        <div id="sa-success" class="card" style="display:none; border:2px solid var(--cyber-green); text-align:center;">
            <div style="font-size:48px; margin-bottom:12px;">✅</div>
            <h3 style="font-size:20px; font-weight:800; color:var(--cyber-green); margin-bottom:8px;">Storm Audit Request Submitted</h3>
            <p style="font-size:14px; color:var(--text-muted);">Our team will review your scope documents and respond within 48 hours.</p>
        </div>
    `;
    
    // Prefill from Firebase user
    prefillStormAuditForm();
}

function prefillStormAuditForm() {
    const user = firebase.auth().currentUser;
    if (user) {
        document.getElementById("sa-email").value = user.email || "";
        document.getElementById("sa-company").value = user.displayName || "";
    }
}

function submitStormAudit() {
    const company = document.getElementById("sa-company").value.trim();
    const name = document.getElementById("sa-name").value.trim();
    const email = document.getElementById("sa-email").value.trim();
    const state = document.getElementById("sa-state").value;
    const city = document.getElementById("sa-city").value.trim();
    const zip = document.getElementById("sa-zip").value.trim();
    const claim = document.getElementById("sa-claim").value.trim();
    const structures = document.getElementById("sa-structures").value.trim();
    const docLink = document.getElementById("sa-doc-link").value.trim();
    
    // Build the Google Form-compatible payload
    const formData = {
        type: "storm_audit",
        // Match Google Form entry IDs
        entries: {
            "entry.476800857": company,      // Company Name
            "entry.1944912808": name,         // Your Name
            "entry.2021031500": email,        // Corporate Email
            "entry.2131427226": state,        // State
            "entry.327565592": city,          // City
            "entry.654630999": zip,           // ZIP
            "entry.513867674": claim || "",   // Claim (optional)
            "entry.69411161": structures || "", // Structures (optional)
            "entry.89385988": docLink,        // Doc Link
            "entry.1477953076": "I confirm I have the right to share this data and understand it will be used only to run this review." // Confirmation
        },
        submittedAt: new Date().toISOString(),
        userEmail: firebase.auth().currentUser ? firebase.auth().currentUser.email : "",
        userUid: firebase.auth().currentUser ? firebase.auth().currentUser.uid : ""
    };
    
    // Option 1: Send to Apps Script (which writes to Google Sheet)
    fetch(CONFIG.SHOVELS_PROXY, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    }).catch(function() {});
    
    // Option 2: Also submit directly to Google Form (backup)
    submitToGoogleForm(formData);
    
    // Show success
    document.querySelector("#storm-audit-form").closest(".card").style.display = "none";
    document.getElementById("sa-success").style.display = "block";
    document.getElementById("sa-success").scrollIntoView({ behavior: "smooth" });
}

function submitToGoogleForm(formData) {
    // Direct submission to Google Form (ensures data reaches your existing Sheet)
    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdr7bQSqWc9vQnWawKujiAmaVDOsXC_fTmWPQlqYKRSdHCi0w/formResponse";
    
    const formBody = new FormData();
    Object.keys(formData.entries).forEach(function(key) {
        formBody.append(key, formData.entries[key]);
    });
    formBody.append("fvv", "1");
    formBody.append("pageHistory", "0");
    formBody.append("fbzx", Date.now().toString());
    
    fetch(googleFormUrl, {
        method: "POST",
        mode: "no-cors",
        body: formBody
    }).catch(function() {});
}
