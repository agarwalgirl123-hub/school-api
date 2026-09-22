const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto'); // API key generate karne ke liye

const app = express();
app.use(cors());
app.use(express.json()); // JSON body parse karne ke liye
app.use(express.static('public'));

// API Keys store karne ke liye (abhi memory me save ho rahi hain)
const validApiKeys = new Set();
// Ek default master key daal dete hain testing ke liye
validApiKeys.add("dev-master-key-123");

// 100 Students ka data generate karna
const students = [];
const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Ananya", "Myra", "Kiara", "Diya", "Pari", "Riya", "Avni", "Aanya", "Rahul", "Priya", "Amit", "Neha"];
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Joshi", "Desai", "Mehta"];

for(let i=1; i<=100; i++) {
    students.push({
        id: i,
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        age: Math.floor(Math.random() * 8) + 10 // age 10 to 17
    });
}

// Middleware: API Key Check karne ke liye
const apiKeyAuth = (req, res, next) => {
    // Header me se 'x-api-key' nikalna
    const apiKey = req.header('x-api-key');
    
    if (!apiKey) {
        return res.status(401).json({ error: "Access Denied. API Key is missing." });
    }
    
    if (!validApiKeys.has(apiKey)) {
        return res.status(401).json({ error: "Invalid API Key. Please provide a valid key." });
    }
    
    // Agar key theek hai toh agle step (API route) pe jaane do
    next();
};

// Admin Route: Nayi API Key generate karne ke liye
app.post('/api/admin/generate-key', (req, res) => {
    // 'sk_' ke sath random secure string jodna
    const newKey = "sk_" + crypto.randomBytes(12).toString('hex');
    validApiKeys.add(newKey);
    res.json({ success: true, apiKey: newKey, message: "New API Key generated successfully!" });
});

// Route: API Key Verify karne ke liye (Frontend Verification Box ke liye)
app.post('/api/verify-key', (req, res) => {
    const { apiKey } = req.body;
    if (validApiKeys.has(apiKey)) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

// MAIN API: Sabhi students ko get karna (Sirf valid API Key wale hi use kar sakte hain)
app.get('/api/students', apiKeyAuth, (req, res) => {
    res.json(students);
});

// MAIN API: Single student ko ID se get karna (Sirf valid API Key wale hi use kar sakte hain)
app.get('/api/students/:id', apiKeyAuth, (req, res) => {
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ error: "Student not found (ID mismatch)" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
