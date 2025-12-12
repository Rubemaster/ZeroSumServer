require('dotenv').config();
const express = require('express');
const duckdb = require('duckdb');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const AlpacaClient = require('./alpaca');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const DB_PATH = path.join(__dirname, 'financials.duckdb');
const DB_URL = process.env.DATABASE_URL; // URL to download database from

// Function to download database
async function downloadDatabase(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading database from ${url}...`);
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destination);

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(destination);
        return downloadDatabase(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destination);
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      let lastLoggedPercent = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = Math.floor((downloadedSize / totalSize) * 100);
        if (percent >= lastLoggedPercent + 10) {
          console.log(`Download progress: ${percent}%`);
          lastLoggedPercent = percent;
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('Database download completed');
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destination);
      reject(err);
    });
  });
}

// Initialize database connection
let db;
let connection;
let financialsQuery;

async function initializeDatabase() {
  // Check if database exists, if not and URL is provided, download it
  if (!fs.existsSync(DB_PATH) && DB_URL) {
    try {
      await downloadDatabase(DB_URL, DB_PATH);
    } catch (error) {
      console.error('Failed to download database:', error.message);
      throw error;
    }
  } else if (!fs.existsSync(DB_PATH)) {
    throw new Error('Database file not found and DATABASE_URL not set');
  }

  // Initialize DuckDB
  db = new duckdb.Database(DB_PATH);
  connection = db.connect();

  // Load SQL query
  financialsQuery = fs.readFileSync(path.join(__dirname, 'financials.sql'), 'utf8');

  console.log('Database initialized successfully');
}

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

// ============ Market Data Endpoints ============

// Get price history for a stock
app.get('/api/market/bars/:symbol', async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Alpaca client not configured'
    });
  }

  const { symbol } = req.params;
  const { timeframe, start, end, limit, adjustment, feed } = req.query;

  try {
    const data = await alpacaClient.getPriceHistory(symbol.toUpperCase(), {
      timeframe,
      start,
      end,
      limit: limit ? parseInt(limit) : undefined,
      adjustment,
      feed
    });

    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch price history',
      details: error.response?.data || error.message
    });
  }
});

// Get latest quote for a stock
app.get('/api/market/quote/:symbol', async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Alpaca client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const data = await alpacaClient.getLatestQuote(symbol.toUpperCase());
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch quote',
      details: error.response?.data || error.message
    });
  }
});

// Get latest trade for a stock
app.get('/api/market/trade/:symbol', async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Alpaca client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const data = await alpacaClient.getLatestTrade(symbol.toUpperCase());
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch trade',
      details: error.response?.data || error.message
    });
  }
});

// Start the server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
