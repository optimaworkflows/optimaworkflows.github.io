const CONFIG = {
    FIREBASE: {
        apiKey: "AIzaSyByA5URVNnpb0Vugq5TnlmfKw9TChxDD90",
        authDomain: "optima-workflows.firebaseapp.com",
        projectId: "optima-workflows",
        storageBucket: "optima-workflows.firebasestorage.app",
        messagingSenderId: "877555560659",
        appId: "1:877555560659:web:35daa074996cab7bc72426"
    },
    
    SHOVELS_PROXY: "https://script.google.com/macros/s/AKfycbzuwNoDCa8X87iq3Q_UP1ehb1uvxEAYedVHf8745uF1DsNsIBjpV7JTxeT7AUuVjuqE/exec",
    LOGGING_URL: "https://script.google.com/macros/s/AKfycbzuwNoDCa8X87iq3Q_UP1ehb1uvxEAYedVHf8745uF1DsNsIBjpV7JTxeT7AUuVjuqE/exec",
    
    FRED_API_KEY: "aefa10f5ba04b679653f16ecace750b5",
    COURT_LISTENER_KEY: "d69093b10b8c1f1133c5fbef368e89d52517c4a4",
    CENSUS_API_KEY: "adc98c57ae5ba855e42fbabbdb597d0a321e7269",
    
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
        }
    },
    
    BANK: {
        NAME: "JPMORGAN CHASE BANK, N.A",
        ACCOUNT: "20000045856166",
        ROUTING_ACH: "028000024",
        ROUTING_FEDWIRE: "021000021",
        ACCOUNT_NAME: "AMIT GUPTA"
    }
};
