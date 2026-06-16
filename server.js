const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB ഡാറ്റാബേസ് ലിങ്ക് (നിങ്ങളുടെ ഒറിജിനൽ ലിങ്ക് ഉണ്ടെങ്കിൽ അത് ഇവിടെ നൽകാം)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:kavach123@cluster0.mongodb.net/kavach?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Connection Error: ", err));

// പരാതികൾ ഡാറ്റാബേസിൽ സൂക്ഷിക്കാനുള്ള ഘടന
const ReportSchema = new mongoose.Schema({
    school: String,
    complaint: String,
    reported_from_ip: String,
    timestamp: String,
    photo_evidence: String
});

const Report = mongoose.model('Report', ReportSchema);

// ഫ്രണ്ട്-എൻഡിൽ നിന്ന് പരാതികൾ സ്വീകരിക്കുന്ന ലിങ്ക് (POST)
app.post('/api/report', async (req, res) => {
    try {
        const { school, complaint, reported_from_ip, timestamp, photo_evidence } = req.body;
        const newReport = new Report({ school, complaint, reported_from_ip, timestamp, photo_evidence });
        await newReport.save();
        res.json({ success: true, message: "Complaint saved!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// അഡ്മിൻ പേജിലേക്ക് പരാതികൾ അയക്കുന്ന ലിങ്ക് (GET)
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ _id: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
