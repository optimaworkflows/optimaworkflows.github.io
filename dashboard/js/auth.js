// ============================================================
// AUTHENTICATION MODULE
// ============================================================

document.getElementById("btn-login-pass").addEventListener("click", function() {
    var email = document.getElementById("auth-email").value.trim();
    var password = document.getElementById("auth-password").value;
    
    if (email === "operations@vanguard.com" && password === "vanguard2026") {
        document.getElementById("step-password-box").style.display = "none";
        document.getElementById("step-twofactor-box").style.display = "block";
    } else {
        alert("Invalid credentials");
    }
});

document.getElementById("btn-login-2fa").addEventListener("click", function() {
    var token = document.getElementById("auth-2fa-token").value.trim();
    
    if (token === "481516") {
        document.getElementById("auth-overlay").style.display = "none";
        document.getElementById("dashboard-wrapper").style.display = "flex";
    } else {
        alert("Invalid token");
    }
});
