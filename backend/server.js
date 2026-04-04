const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Assuming no password for root
  database: 'daily_tracker'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Create tables if not exist
db.query(`
  CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    time TIME,
    name VARCHAR(255),
    category VARCHAR(100),
    duration DECIMAL(5,2),
    status VARCHAR(50),
    notes TEXT
  )
`, (err) => {
  if (err) console.error('Error creating activities table:', err);
});

db.query(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    name VARCHAR(255),
    category VARCHAR(100),
    amount DECIMAL(10,2),
    mode VARCHAR(50),
    notes TEXT
  )
`, (err) => {
  if (err) console.error('Error creating expenses table:', err);
});

// API Routes

// Get all activities
app.get('/api/activities', (req, res) => {
  db.query('SELECT * FROM activities ORDER BY date DESC, time DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add activity
app.post('/api/activities', (req, res) => {
  const { date, time, name, category, duration, status, notes } = req.body;
  db.query('INSERT INTO activities (date, time, name, category, duration, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [date, time, name, category, duration, status, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// Delete activity
app.delete('/api/activities/:id', (req, res) => {
  db.query('DELETE FROM activities WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
  db.query('SELECT * FROM expenses ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add expense
app.post('/api/expenses', (req, res) => {
  const { date, name, category, amount, mode, notes } = req.body;
  db.query('INSERT INTO expenses (date, name, category, amount, mode, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [date, name, category, amount, mode, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  db.query('DELETE FROM expenses WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});