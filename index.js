require('dotenv').config();
const express = require('express');
const duckdb = require('duckdb');
const fs = require('fs');
const path = require('path');
const AlpacaClient = require('./alpaca');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Alpaca client if credentials are provided
let alpacaClient = null;
if (process.env.ALPACA_CLIENT_ID && process.env.ALPACA_PRIVATE_KEY) {
  try {
    // Reconstruct PEM format from base64 key
    const privateKeyBase64 = process.env.ALPACA_PRIVATE_KEY;
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`;

    alpacaClient = new AlpacaClient(
      process.env.ALPACA_CLIENT_ID,
      privateKey,
      process.env.ALPACA_BASE_URL
    );
    console.log('Alpaca Broker API integration enabled');
  } catch (error) {
    console.error('Error initializing Alpaca client:', error.message);
    console.log('Running without ticker enrichment');
  }
} else {
  console.log('Alpaca credentials not found - running without ticker enrichment');
}

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
app.get('/api/financials', async (req, res) => {
  const { company, enrichAlpaca } = req.query;

  if (!company) {
    return res.status(400).json({
      error: 'Missing required parameter: company',
      usage: '/api/financials?company=<company_name>&enrichAlpaca=true'
    });
  }

  // Use ILIKE for case-insensitive partial matching
  const searchPattern = `%${company}%`;

  connection.all(financialsQuery, [searchPattern], async (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    let results = rows;

    // Enrich with Alpaca data if requested and client is available
    if (enrichAlpaca === 'true' && alpacaClient) {
      try {
        results = await Promise.all(
          rows.map(row => alpacaClient.enrichFinancialData(row))
        );
      } catch (error) {
        console.error('Error enriching with Alpaca data:', error);
        // Continue with unenriched data
      }
    }

    res.json({
      query: company,
      count: results.length,
      alpacaEnriched: enrichAlpaca === 'true' && alpacaClient !== null,
      results: results
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
