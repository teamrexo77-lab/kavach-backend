const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'complaints.json');

// KAVACH-ന്റെ സുരക്ഷയ്ക്കായി യൂസറുടെ IP Address ട്രാക്ക് ചെയ്യുന്നത് പൂർണ്ണമായി തടയുന്നു
app.set('trust proxy', false);

app.use(cors()); 
app.use(express.json());

// 1. സെർവർ റൺ ചെയ്യുമ്പോൾ Render-ന് ആവശ്യമായ package.json ഫയൽ ഓട്ടോമാറ്റിക് ആയി ഉണ്ടാക്കാനുള്ള കോഡ്
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    const packageJsonContent = {
        "name": "kavach-backend",
        "version": "1.0.0",
        "main": "server.js",
        "dependencies": {
            "express": "^4.19.2",
            "cors": "^2.8.5"
        }
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
}

// 2. പരാതികൾ ഫ്രണ്ട്‌എൻഡിൽ നിന്ന് സ്വീകരിച്ച് സേവ് ചെയ്യാനുള്ള API (POST)
app.post('/api/report', (req, res) => {
    const { school, complaint } = req.body;

    if (!school || !complaint) {
        return res.json({ success: false, message: "എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക!" });
    }

    // പരാതിയുടെ ഉള്ളടക്കം മാത്രം (വ്യക്തിഗത വിവരങ്ങളോ IP-യോ ഇല്ല)
    const newComplaint = {
        school: school,
        complaint: complaint,
        timestamp: new Date().toISOString()
    };

    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        let complaintsList = [];
        if (!err && data) {
            try {
                complaintsList = JSON.parse(data);
            } catch (e) {
                complaintsList = [];
            }
        }
        
        complaintsList.push(newComplaint);

        fs.writeFile(FILE_PATH, JSON.stringify(complaintsList, null, 2), (writeErr) => {
            if (writeErr) {
                return res.json({ success: false, message: "സെർവർ പിശക്!" });
            }
            res.json({ success: true, message: "നിങ്ങളുടെ പരാതി അതീവ രഹസ്യമായി രേഖപ്പെടുത്തിയിരിക്കുന്നു!" });
        });
    });
});

// 3. സ്കൂൾ അധികൃതർക്ക് പരാതികൾ റീഡ് ചെയ്യാനുള്ള API (GET)
app.get('/api/complaints', (req, res) => {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err || !data) {
            return res.json([]);
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.json([]);
        }
    });
});

// സെർവർ ലൈവ് ആകുമ്പോൾ കാണിക്കുന്ന മെസ്സേജ്
app.get('/', (req, res) => {
    res.send('KAVACH V2 Secure Backend Server is Running Live!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
