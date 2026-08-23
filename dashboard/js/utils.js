// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatCurrency(value) {
    if (value >= 1000000) return "$" + (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return "$" + Math.round(value / 1000) + "K";
    return "$" + value;
}

function getTodayISO() {
    return new Date().toISOString().slice(0, 10);
}

function getDaysAgoISO(days) {
    return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

function logToSheet(data) {
    fetch(CONFIG.LOGGING_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).catch(function() {});
}

function getCachedData(key, maxAgeMinutes) {
    try {
        var cached = localStorage.getItem("optima_" + key);
        if (cached) {
            var parsed = JSON.parse(cached);
            if ((Date.now() - parsed.timestamp) / 60000 < maxAgeMinutes) {
                return parsed.data;
            }
        }
    } catch(e) {}
    return null;
}

function setCachedData(key, data) {
    try {
        localStorage.setItem("optima_" + key, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
    } catch(e) {}
}
