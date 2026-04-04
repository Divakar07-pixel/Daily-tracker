require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};
const dbName = process.env.DB_NAME || 'daily_tracker';

const initDb = mysql.createConnection(dbConfig);
initDb.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server:', err);
    return;
  }

  initDb.query('CREATE DATABASE IF NOT EXISTS ' + dbName + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      initDb.end();
      return;
    }

    initDb.end();
    startApp();
  });
});

function startApp() {
  const db = mysql.createConnection({
    ...dbConfig,
    database: dbName,
  });

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      return;
    }
    console.log('Connected to MySQL database');

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

    app.locals.db = db;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

function getDb() {
  return app.locals.db;
}

// API Routes

// Get all activities
app.get('/api/activities', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  db.query('SELECT * FROM activities ORDER BY date DESC, time DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add activity
app.post('/api/activities', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  const { date, time, name, category, duration, status, notes } = req.body;
  db.query('INSERT INTO activities (date, time, name, category, duration, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [date, time, name, category, duration, status, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// Delete activity
app.delete('/api/activities/:id', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  db.query('DELETE FROM activities WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  db.query('SELECT * FROM expenses ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add expense
app.post('/api/expenses', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  const { date, name, category, amount, mode, notes } = req.body;
  db.query('INSERT INTO expenses (date, name, category, amount, mode, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [date, name, category, amount, mode, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  db.query('DELETE FROM expenses WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Daily summary
app.get('/api/daily-summary/:date?', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });

  const date = req.params.date || new Date().toISOString().slice(0, 10);

  // Get activities for the date
  db.query('SELECT * FROM activities WHERE date = ? ORDER BY time ASC', [date], (err, activities) => {
    if (err) return res.status(500).json({ error: err.message });

    // Get expenses for the date
    db.query('SELECT * FROM expenses WHERE date = ?', [date], (err, expenses) => {
      if (err) return res.status(500).json({ error: err.message });

      // Calculate summary stats
      const totalActivities = activities.length;
      const completedActivities = activities.filter(a => a.status === 'Completed').length;
      const totalHours = activities.reduce((sum, a) => sum + (parseFloat(a.duration) || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

      // Category breakdowns
      const activityCategories = {};
      activities.forEach(a => {
        activityCategories[a.category] = (activityCategories[a.category] || 0) + (parseFloat(a.duration) || 0);
      });

      const expenseCategories = {};
      expenses.forEach(e => {
        expenseCategories[e.category] = (expenseCategories[e.category] || 0) + parseFloat(e.amount);
      });

      res.json({
        date,
        summary: {
          totalActivities,
          completedActivities,
          totalHours: Math.round(totalHours * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          completionRate: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
        },
        activities,
        expenses,
        activityCategories,
        expenseCategories
      });
    });
  });
});

// Clear all data
app.delete('/api/clear-all', (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: 'Database not initialized' });

  db.query('DELETE FROM activities', (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('DELETE FROM expenses', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'All data cleared successfully' });
    });
  });
});