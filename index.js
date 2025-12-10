const express = require('express');
const duckdb = require('duckdb');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DuckDB
const db = new duckdb.Database(path.join(__dirname, 'financials.duckdb'));
const connection = db.connect();

// Load SQL query
const financialsQuery = fs.readFileSync(path.join(__dirname, 'financials.sql'), 'utf8');

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ZeroSum Server' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Financial data endpoint - search companies by name
app.get('/api/financials', (req, res) => {
  const { company } = req.query;

  if (!company) {
    return res.status(400).json({
      error: 'Missing required parameter: company',
      usage: '/api/financials?company=<company_name>'
    });
  }

  // Use ILIKE for case-insensitive partial matching
  const searchPattern = `%${company}%`;

  connection.all(financialsQuery, [searchPattern], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    res.json({
      query: company,
      count: rows.length,
      results: rows
    });
  });
});

// Get unique company names (for autocomplete/suggestions)
app.get('/api/companies', (req, res) => {
  const { search } = req.query;

  let query = 'SELECT DISTINCT name FROM SUB ORDER BY name';
  let params = [];

  if (search) {
    query = 'SELECT DISTINCT name FROM SUB WHERE name ILIKE ? ORDER BY name LIMIT 100';
    params = [`%${search}%`];
  }

  connection.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    res.json({
      count: rows.length,
      companies: rows.map(row => row.name)
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
