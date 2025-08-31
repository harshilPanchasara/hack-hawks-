// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(express.json());
app.use(express.static(__dirname)); // Serve HTML/CSS/JS

// --- Helper function to save data to a JSON file safely ---
function saveData(filename, data) {
  const filePath = path.join(__dirname, filename);
  let currentData = [];

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (raw) currentData = JSON.parse(raw);
  }

  currentData.push(data);
  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
}

// ------------------------ REPORTS ------------------------
app.post('/api/reports', (req, res) => {
  const report = req.body;
  report.id = Date.now();
  report.approved = false; // default not approved
  saveData('reports.json', report);
  res.json({ success: true, report });
});

app.get('/api/reports', (req, res) => {
  const filePath = path.join(__dirname, 'reports.json');
  if (fs.existsSync(filePath)) {
    const reports = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(reports);
  } else {
    res.json([]);
  }
});

// DELETE a report (reject)
app.delete('/api/reports/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const filePath = path.join(__dirname, 'reports.json');
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });

  let reports = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const newReports = reports.filter(r => r.id !== id);
  fs.writeFileSync(filePath, JSON.stringify(newReports, null, 2), 'utf-8');
  res.json({ success: true });
});

// Approve a report
app.post('/api/reports/:id/approve', (req, res) => {
  const id = parseInt(req.params.id);
  const filePath = path.join(__dirname, 'reports.json');
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });

  let reports = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const report = reports.find(r => r.id === id);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

  report.approved = true;
  fs.writeFileSync(filePath, JSON.stringify(reports, null, 2), 'utf-8');
  res.json({ success: true });
});

// ------------------------ VOLUNTEERS ------------------------
app.post('/api/volunteers', (req, res) => {
  const { name, email, phone, skills } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const volunteer = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    skills: skills || ''
  };

  saveData('volunteers.json', volunteer);
  res.json({ success: true, volunteer });
});

app.get('/api/volunteers', (req, res) => {
  const filePath = path.join(__dirname, 'volunteers.json');
  if (fs.existsSync(filePath)) {
    const volunteers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(volunteers);
  } else {
    res.json([]);
  }
});

// ------------------------ ALERTS ------------------------
app.post('/api/alerts', (req, res) => {
  const alert = req.body;
  alert.id = Date.now();
  saveData('alerts.json', alert);
  res.json({ success: true, alert });
});

app.get('/api/alerts', (req, res) => {
  const filePath = path.join(__dirname, 'alerts.json');
  if (fs.existsSync(filePath)) {
    const alerts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(alerts);
  } else {
    res.json([]);
  }
});

// ------------------------ DONATIONS ------------------------
app.post('/api/donations', (req, res) => {
  const { name, amount, photoUrl } = req.body;

  if (!name || !amount) {
    return res.status(400).json({ success: false, message: 'Name and amount are required' });
  }

  const donation = {
    id: Date.now(),
    name,
    amount,
    photoUrl: photoUrl || '',
    dateTime: new Date().toISOString()
  };

  saveData('donations.json', donation);
  res.json({ success: true, donation });
});

app.get('/api/donations', (req, res) => {
  const filePath = path.join(__dirname, 'donations.json');
  if (fs.existsSync(filePath)) {
    const donations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(donations);
  } else {
    res.json([]);
  }
});
// ------------------------ LEADERBOARD ------------------------
app.get('/api/leaderboard', (req, res) => {
  const filePath = path.join(__dirname, 'reports.json');

  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  const reports = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Count reports per location
  const leaderboard = {};
  reports.forEach(r => {
    const loc = r.location || 'Unknown';
    leaderboard[loc] = (leaderboard[loc] || 0) + 1;
  });

  // Convert to array and sort by count descending
  const sortedLeaderboard = Object.entries(leaderboard)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  res.json(sortedLeaderboard);
});


// ------------------------ START SERVER ------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
