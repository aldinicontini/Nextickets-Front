const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'reports_db.json');

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize dummy DB file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Function to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return [];
  }
};

// Function to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error);
  }
};

// ── OTROS DB (Categorías personalizadas) ──
const OTROS_DB_FILE = path.join(__dirname, 'otros_db.json');

if (!fs.existsSync(OTROS_DB_FILE)) {
  fs.writeFileSync(OTROS_DB_FILE, JSON.stringify([]));
}

const readOtrosDB = () => {
  try {
    return JSON.parse(fs.readFileSync(OTROS_DB_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
};

const writeOtrosDB = (data) => {
  try {
    fs.writeFileSync(OTROS_DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing Otros DB:', error);
  }
};

// GET all reports
app.get('/api/reports', (req, res) => {
  res.json(readDB());
});

// POST new report
app.post('/api/reports', (req, res) => {
  const reports = readDB();
  const newReport = {
    ...req.body,
    id: Date.now().toString(),
    creadoEn: req.body.fecha || new Date().toISOString()
  };
  reports.unshift(newReport); // Add to beginning (newest first)
  writeDB(reports);
  res.status(201).json(newReport);
});

// PUT update report status/comments
app.put('/api/reports/:id', (req, res) => {
  const reports = readDB();
  const index = reports.findIndex(r => r.id === req.params.id);
  
  if (index !== -1) {
    reports[index] = { ...reports[index], ...req.body };
    writeDB(reports);
    res.json(reports[index]);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// DELETE report
app.delete('/api/reports/:id', (req, res) => {
  let reports = readDB();
  const initialLength = reports.length;
  reports = reports.filter(r => r.id !== req.params.id);
  
  if (reports.length < initialLength) {
    writeDB(reports);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// ── APIS FOR OTROS CATEGORIES ──
app.get('/api/otros-categories', (req, res) => {
  res.json(readOtrosDB());
});

app.post('/api/otros-categories', (req, res) => {
  const cats = readOtrosDB();
  const newCat = {
    id: 'custom_' + Date.now(),
    label: req.body.label,
    categoryId: req.body.categoryId || 'otros_personalizado'
  };
  cats.push(newCat);
  writeOtrosDB(cats);
  res.status(201).json(newCat);
});

app.put('/api/otros-categories/:id', (req, res) => {
  const cats = readOtrosDB();
  const index = cats.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    cats[index].label = req.body.label;
    writeOtrosDB(cats);
    res.json(cats[index]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/otros-categories/:id', (req, res) => {
  let cats = readOtrosDB();
  const initial = cats.length;
  cats = cats.filter(c => c.id !== req.params.id);
  if (cats.length < initial) {
    writeOtrosDB(cats);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend server running at http://0.0.0.0:${PORT}`);
});
