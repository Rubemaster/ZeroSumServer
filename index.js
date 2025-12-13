require('dotenv').config({ override: true });
const express = require('express');
const duckdb = require('duckdb');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');
const { AlpacaClient, FinnhubClient, YahooFinanceClient } = require('./src/clients');
const RedisCache = require('./src/cache/redis');
const { TimeSeriesCalculator, CALCULATIONS } = require('./src/services/timeSeries');

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
  financialsQuery = fs.readFileSync(path.join(__dirname, 'src/db/financials.sql'), 'utf8');

  console.log('Database initialized successfully');
}

// Initialize Redis cache
const redisCache = new RedisCache();

// Initialize Alpaca client for data enrichment (optional)
let alpacaClient = null;
if (process.env.ALPACA_CLIENT_ID && process.env.ALPACA_CLIENT_SECRET) {
  try {
    alpacaClient = new AlpacaClient({
      clientId: process.env.ALPACA_CLIENT_ID,
      clientSecret: process.env.ALPACA_CLIENT_SECRET,
      authURL: process.env.ALPACA_AUTH_URL || 'https://authx.sandbox.alpaca.markets',
      brokerURL: process.env.ALPACA_BROKER_URL || 'https://broker-api.sandbox.alpaca.markets'
    });
    console.log('Alpaca Broker API enabled (for data enrichment)');
  } catch (error) {
    console.error('Error initializing Alpaca client:', error.message);
  }
}

// Initialize Finnhub client for market data (cache will be set after Redis connects)
let finnhubClient = null;

// Initialize Yahoo Finance client (cache will be set after Redis connects)
let yahooFinance = null;

// Middleware to parse JSON bodies
app.use(express.json());

// CORS middleware for frontend integration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Clerk middleware - this adds auth info to all requests
app.use(clerkMiddleware());

// Basic route (public)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ZeroSum Server' });
});

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ Protected API Routes ============
// All routes below require authentication

// Financial data endpoint - search companies by name
app.get('/api/financials', requireAuth(), async (req, res) => {
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
app.get('/api/companies', requireAuth(), (req, res) => {
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

// ============ Market Data Endpoints (Finnhub) ============

// Get price history/candles for a stock
app.get('/api/market/bars/:symbol', requireAuth(), async (req, res) => {
  if (!finnhubClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol } = req.params;
  const { resolution, from, to } = req.query;

  try {
    const data = await finnhubClient.getCandles(
      symbol,
      resolution || 'D',
      from ? parseInt(from) : undefined,
      to ? parseInt(to) : undefined
    );

    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch price history',
      details: error.response?.data || error.message
    });
  }
});

// Get real-time quote for a stock
app.get('/api/market/quote/:symbol', requireAuth(), async (req, res) => {
  if (!finnhubClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const data = await finnhubClient.getQuote(symbol);
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch quote',
      details: error.response?.data || error.message
    });
  }
});

// Get company profile
app.get('/api/market/profile/:symbol', requireAuth(), async (req, res) => {
  if (!finnhubClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const data = await finnhubClient.getCompanyProfile(symbol);
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch company profile',
      details: error.response?.data || error.message
    });
  }
});

// Search for symbols/companies
app.get('/api/market/search', requireAuth(), async (req, res) => {
  if (!finnhubClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      error: 'Missing required parameter: q',
      usage: '/api/market/search?q=<query>'
    });
  }

  try {
    const data = await finnhubClient.searchSymbols(q);
    res.json({ query: q, results: data });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to search symbols',
      details: error.response?.data || error.message
    });
  }
});

// Get basic financials (P/E, EPS, etc.)
app.get('/api/market/financials/:symbol', requireAuth(), async (req, res) => {
  if (!finnhubClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const data = await finnhubClient.getBasicFinancials(symbol);
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch financials',
      details: error.response?.data || error.message
    });
  }
});

// Get news (market or company-specific)
app.get('/api/market/news', requireAuth(), async (req, res) => {
  if (!finnhubClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol, from, to } = req.query;

  try {
    const data = await finnhubClient.getNews(symbol, from, to);
    res.json({ symbol: symbol || 'general', news: data });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch news',
      details: error.response?.data || error.message
    });
  }
});

// ============ Graham Number Endpoint ============

// Estimate assets using two methods and provide conservative/best estimates
app.get('/api/graham/:symbol', requireAuth(), async (req, res) => {
  if (!finnhubClient) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const [financials, profile] = await Promise.all([
      finnhubClient.getBasicFinancials(symbol),
      finnhubClient.getCompanyProfile(symbol)
    ]);

    const metrics = financials.metric || {};
    const sharesOutstanding = profile.shareOutstanding * 1e6;

    // Extract metrics
    const revenuePerShare = metrics.revenuePerShareAnnual;
    const assetTurnover = metrics.assetTurnoverAnnual;
    const epsAnnual = metrics.epsAnnual;
    const roaRfy = metrics.roaRfy;

    // Derived values
    const totalRevenue = revenuePerShare * sharesOutstanding;
    const netIncome = epsAnnual * sharesOutstanding;

    // Method 1: Asset Turnover - Total Assets = Revenue / Asset Turnover
    const assets1 = assetTurnover ? totalRevenue / assetTurnover : null;

    // Method 2: ROA - Total Assets = Net Income / (ROA / 100)
    const assets2 = roaRfy ? netIncome / (roaRfy / 100) : null;

    // Conservative: use the lower estimate
    const validAssets = [assets1, assets2].filter(v => v !== null);
    const conservative = validAssets.length > 0 ? Math.min(...validAssets) : null;

    // Best: Asset Turnover method is more accurate (uses revenue which is more reliably reported)
    const best = assets1;

    // Format to billions
    const toBillions = (val) => val ? parseFloat((val / 1e9).toFixed(2)) : null;

    res.json({
      assets1: toBillions(assets1),
      assets2: toBillions(assets2),
      conservative: toBillions(conservative),
      best: toBillions(best)
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to calculate assets',
      details: error.response?.data || error.message
    });
  }
});

// ============ Time Series Endpoints (using framework) ============

// Time series calculator instance (initialized after finnhubClient)
let timeSeriesCalc = null;

// Assets history endpoint
app.get('/api/graham/history/:symbol', requireAuth(), async (req, res) => {
  if (!timeSeriesCalc) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const result = await timeSeriesCalc.calculate(symbol, CALCULATIONS.assets);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to calculate historical assets',
      details: error.response?.data || error.message
    });
  }
});

// Revenue history endpoint
// Returns salesRevenue: Revenue from Contracts with Customers (ASC 606)
app.get('/api/revenue/history/:symbol', requireAuth(), async (req, res) => {
  if (!timeSeriesCalc) {
    return res.status(503).json({
      error: 'Market data not available',
      details: 'Finnhub client not configured'
    });
  }

  const { symbol } = req.params;

  try {
    const result = await timeSeriesCalc.calculate(symbol, CALCULATIONS.revenue);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to calculate historical revenue',
      details: error.response?.data || error.message
    });
  }
});

// ============ Yahoo Finance Endpoints (Historical Data) ============

// Get historical price data for charting
app.get('/api/history/:symbol', requireAuth(), async (req, res) => {
  const { symbol } = req.params;
  const { range, interval, period1, period2 } = req.query;

  try {
    const data = await yahooFinance.getHistory(symbol, {
      range: range || '1y',
      interval: interval || '1d',
      period1: period1 ? parseInt(period1) : undefined,
      period2: period2 ? parseInt(period2) : undefined
    });

    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch historical data',
      details: error.message
    });
  }
});

// Get current quote via Yahoo Finance
app.get('/api/yahoo/quote/:symbol', requireAuth(), async (req, res) => {
  const { symbol } = req.params;

  try {
    const data = await yahooFinance.getQuote(symbol);
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch quote',
      details: error.message
    });
  }
});

// ============ User Info Endpoint ============

// Get current user info (for debugging/display)
app.get('/api/user', requireAuth(), (req, res) => {
  const { userId } = getAuth(req);
  res.json({ userId });
});

// Start the server
async function startServer() {
  try {
    // Initialize Redis cache
    await redisCache.connect();

    // Initialize clients with cache
    if (process.env.FINNHUB_API_KEY) {
      finnhubClient = new FinnhubClient(process.env.FINNHUB_API_KEY, redisCache);
      timeSeriesCalc = new TimeSeriesCalculator(finnhubClient);
      console.log('Finnhub Market Data API enabled (with Redis cache)');
    } else {
      console.log('Finnhub API key not found - market data endpoints disabled');
    }

    yahooFinance = new YahooFinanceClient(redisCache);
    console.log('Yahoo Finance API enabled (with Redis cache)');

    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Clerk authentication enabled');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
