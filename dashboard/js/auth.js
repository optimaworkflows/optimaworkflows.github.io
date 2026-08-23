// ============================================================
// AUTHENTICATION + ACCESS CONTROL
// ============================================================

firebase.initializeApp(CONFIG.FIREBASE);
const auth = firebase.auth();

// User's subscribed modules (stored in localStorage for demo)
// In production: store in Firebase Firestore
var userModules = [];

function initializeDashboard() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is logged in
            const email = user.email;
            const displayName = user.displayName || email.split('@')[0];
            
            document.getElementById("sidebar-user-name").innerHTML = displayName;
            
            // Get subscribed modules from localStorage
            // In production: fetch from Firestore
            const storedModules = localStorage.getItem("user_modules");
            userModules = storedModules ? JSON.parse(storedModules) : [];
            
            // For demo: if no modules, grant CAT Intelligence
            if (userModules.length === 0) {
                userModules = ["cat-intelligence"];
                localStorage.setItem("user_modules", JSON.stringify(userModules));
            }
            
            // Update tier label
            document.getElementById("sidebar-user-tier").innerHTML = 
                userModules.length + " module" + (userModules.length > 1 ? "s" : "") + " active";
            
            // Build navigation
            buildNavigation();
            
            // Show dashboard
            document.getElementById("loading-screen").style.display = "none";
            document.getElementById("dashboard-wrapper").style.display = "flex";
            
            // Load first module
            if (userModules.length > 0) {
                loadModule(userModules[0]);
            } else {
                document.getElementById("no-access-screen").style.display = "flex";
            }
        } else {
            // Not logged in — redirect to login
            window.location.href = "../login/";
        }
    });
}

function buildNavigation() {
    const navContainer = document.getElementById("nav-modules");
    navContainer.innerHTML = "";
    
    userModules.forEach(function(moduleKey) {
        const module = CONFIG.MODULES[moduleKey];
        if (module) {
            const navItem = document.createElement("div");
            navItem.className = "nav-item";
            navItem.setAttribute("data-module", moduleKey);
            navItem.onclick = function() { loadModule(moduleKey); };
            navItem.innerHTML = "<span>" + module.icon + " " + module.name + "</span>";
            navContainer.appendChild(navItem);
        }
    });
}

function loadModule(moduleKey) {
    // Highlight active nav
    document.querySelectorAll(".nav-item[data-module]").forEach(function(item) {
        item.classList.remove("active");
    });
    document.querySelector('[data-module="' + moduleKey + '"]').classList.add("active");
    
    // Check access
    if (!userModules.includes(moduleKey)) {
        alert("You don't have access to this module. Contact support to upgrade.");
        return;
    }
    
    // Load module content
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = "<p class='lead'>Loading " + CONFIG.MODULES[moduleKey].name + "...</p>";
    
    // Dynamically load the module's JS file
    const script = document.createElement("script");
    script.src = "js/" + CONFIG.MODULES[moduleKey].jsFile;
    script.onload = function() {
        if (typeof initModule === "function") {
            initModule(mainContent, moduleKey);
        }
    };
    document.body.appendChild(script);
}

function showBilling() {
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <h1>Billing & Payments</h1>
        <p class="lead">Your payment details and subscription status.</p>
        <div class="card">
            <h3 class="section-label">Bank Details</h3>
            <div class="financial-line"><span class="financial-label">Bank</span><span class="financial-value">${CONFIG.BANK.NAME}</span></div>
            <div class="financial-line"><span class="financial-label">Account</span><span class="financial-value">${CONFIG.BANK.ACCOUNT}</span></div>
            <div class="financial-line"><span class="financial-label">Routing (ACH)</span><span class="financial-value">${CONFIG.BANK.ROUTING_ACH}</span></div>
            <div class="financial-line"><span class="financial-label">Routing (FEDWIRE)</span><span class="financial-value">${CONFIG.BANK.ROUTING_FEDWIRE}</span></div>
            <div class="financial-line"><span class="financial-label">Account Name</span><span class="financial-value">${CONFIG.BANK.ACCOUNT_NAME}</span></div>
        </div>
        <div class="card">
            <h3 class="section-label">Active Modules</h3>
            <ul>
                ${userModules.map(function(m) { 
                    return "<li style='padding:8px 0; border-bottom:1px solid #1f2937;'>" + CONFIG.MODULES[m].icon + " " + CONFIG.MODULES[m].name + "</li>";
                }).join("")}
            </ul>
        </div>
    `;
}

function showProfile() {
    const user = auth.currentUser;
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <h1>Profile Settings</h1>
        <p class="lead">Your account information.</p>
        <div class="card">
            <div class="financial-line"><span class="financial-label">Name</span><span class="financial-value">${user.displayName || "N/A"}</span></div>
            <div class="financial-line"><span class="financial-label">Email</span><span class="financial-value">${user.email}</span></div>
            <div class="financial-line"><span class="financial-label">UID</span><span class="financial-value">${user.uid}</span></div>
        </div>
    `;
}

function logout() {
    auth.signOut().then(function() {
        localStorage.clear();
        window.location.href = "../login/";
    });
}

// Initialize on page load
initializeDashboard();
