// ============================================================
// OPTIMA WORKFLOWS — CONFIGURATION
// ============================================================

const CONFIG = {
    // Firebase
    FIREBASE: {
        apiKey: "AIzaSyByA5URVNnpb0Vugq5TnlmfKw9TChxDD90",
        authDomain: "optima-workflows.firebaseapp.com",
        projectId: "optima-workflows",
        storageBucket: "optima-workflows.firebasestorage.app",
        messagingSenderId: "877555560659",
        appId: "1:877555560659:web:35daa074996cab7bc72426"
    },
    
    // API Keys (internal only)
    SHOVELS_PROXY: "YOUR_APPS_SCRIPT_URL_HERE",
    FRED_API_KEY: "aefa10f5ba04b679653f16ecace750b5",
    COURT_LISTENER_KEY: "d69093b10b8c1f1133c5fbef368e89d52517c4a4",
    CENSUS_API_KEY: "adc98c57ae5ba855e42fbabbdb597d0a321e7269",
    
    // Module Definitions
    MODULES: {
        "cat-intelligence": {
            name: "CAT Intelligence",
            icon: "🛰️",
            jsFile: "cat-intel.js",
            description: "Pre-deployment zone scoring"
        },
        "storm-audit": {
            name: "Storm Audit",
            icon: "🌪️",
            jsFile: "storm-audit.js",
            description: "Xactimate code verification"
        },
        "vendor-audit": {
            name: "Vendor Audit",
            icon: "🛡️",
            jsFile: "vendor-audit.js",
            description: "Subcontractor compliance"
        },
        "freight-audit": {
            name: "Freight Audit",
            icon: "📦",
            jsFile: "freight-audit.js",
            description: "Shipping chargeback recovery"
        },
        "chargeback-recovery": {
            name: "Chargebacks",
            icon: "💳",
            jsFile: "chargeback.js",
            description: "Retail chargeback recovery"
        },
        "appointment-booking": {
            name: "Appointments",
            icon: "📅",
            jsFile: "appointments.js",
            description: "Insurance inspection scheduling"
        }
    },
    
    // Bank Details
    BANK: {
        NAME: "JPMORGAN CHASE BANK, N.A",
        ACCOUNT: "20000045856166",
        ROUTING_ACH: "028000024",
        ROUTING_FEDWIRE: "021000021",
        ACCOUNT_NAME: "AMIT GUPTA"
    }
};
const CONFIG = {
    SHOVELS_PROXY: "https://script.google.com/macros/s/AKfycbyARSRA8VmCjY9Ax7ZRwG4ZZJ4RYHEVwfXDM_SQfM9U-1nDH4cHWzwMotjWvH9JI7EjBg/exec",
    LOGGING_URL: "https://script.google.com/macros/s/AKfycbzuwNoDCa8X87iq3Q_UP1ehb1uvxEAYedVHf8745uF1DsNsIBjpV7JTxeT7AUuVjuqE/exec",
    // ... rest of config
};
