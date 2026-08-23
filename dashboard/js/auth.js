// ============================================================
// AUTHENTICATION + ACCESS CONTROL (CORRECTED)
// ============================================================

firebase.initializeApp(CONFIG.FIREBASE);
const auth = firebase.auth();

var userModules = [];

function initializeDashboard() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User IS logged in
            const email = user.email;
            const displayName = user.displayName || email.split('@')[0];
            
            document.getElementById("sidebar-user-name").innerHTML = displayName;
            
            // Get subscribed modules
            const storedModules = localStorage.getItem("user_modules");
            userModules = storedModules ? JSON.parse(storedModules) : ["cat-intelligence", "storm-audit"];
            
            // Save modules
            localStorage.setItem("user_modules", JSON.stringify(userModules));
            
            document.getElementById("sidebar-user-tier").innerHTML = 
                userModules.length + " module" + (userModules.length > 1 ? "s" : "") + " active";
            
            buildNavigation();
            
            document.getElementById("loading-screen").style.display = "none";
            document.getElementById("dashboard-wrapper").style.display = "flex";
            
            if (userModules.length > 0) {
                loadModule(userModules[0]);
            } else {
                document.getElementById("no-access-screen").style.display = "flex";
            }
        } else {
            // NOT logged in — redirect to login
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
    document.querySelectorAll(".nav-item[data-module]").forEach(function(item) {
        item.classList.remove("active");
    });
    document.querySelector('[data-module="' + moduleKey + '"]').classList.add("active");
    
    if (!userModules.includes(moduleKey)) {
        alert("You don't have access to this module.");
        return;
    }
    
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = "<p class='lead'>Loading " + CONFIG.MODULES[moduleKey].name + "...</p>";
    
    const script = document.createElement("script");
    script.src = "js/" + CONFIG.MODULES[moduleKey].jsFile;
    script.onload = function() {
        if (typeof initModule === "function") {
            initModule(mainContent, moduleKey);
        }
    };
    document.body.appendChild(script);
}

function logout() {
    auth.signOut().then(function() {
        localStorage.clear();
        window.location.href = "../login/";
    });
}

initializeDashboard();
