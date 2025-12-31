require('dotenv').config({ override: true });
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { clerkMiddleware, requireAuth, getAuth, clerkClient, verifyToken } = require('@clerk/express');
const { AlpacaClient, IndividualAlpacaClient, FinnhubClient, YahooFinanceClient, SumsubClient, PolygonClient, SECClient, SupabaseClient } = require('./src/clients');
const RedisCache = require('./src/cache/redis');
const cacheRulesManager = require('./src/cache/cache-rules');
const { TimeSeriesCalculator, CALCULATIONS } = require('./src/services/timeSeries');
const { encrypt, decrypt, isEncryptionConfigured } = require('./src/utils/encryption');

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;
if (stripe) {
  console.log('Stripe API enabled');
}

const app = express();
const PORT = process.env.PORT || 3000;

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

// Initialize Polygon client for reference data (cache will be set after Redis connects)
let polygonClient = null;

// Initialize Sumsub client for KYC verification
let sumsubClient = null;
if (process.env.SUMSUB_APP_TOKEN && process.env.SUMSUB_SECRET_KEY) {
  sumsubClient = new SumsubClient(
    process.env.SUMSUB_APP_TOKEN,
    process.env.SUMSUB_SECRET_KEY
  );
  console.log('Sumsub KYC verification enabled');
}

// Initialize Supabase client
let supabaseClient = new SupabaseClient();
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  console.log('Supabase database enabled');
} else if (supabaseClient.hasStoredConnectionString()) {
  console.log('Database enabled via stored connection string');
} else {
  console.log('Database credentials not found - database features disabled');
  supabaseClient = null;
}

// Initialize SEC client (will use Supabase)
let secClient = null;

// Track active SEC SSE connections
const secConnections = new Set();

// Middleware to parse JSON bodies (increased limit for bulk SEC filings import)
app.use(express.json({ limit: '50mb' }));

// CORS middleware for frontend integration
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173', // Landing page
  'http://localhost:5174', // Admin dashboard
  'http://localhost:5175', // SEC News
  'http://localhost:5176', // Main app
  'http://localhost:5179', // Admin dashboard (alternate port)
  'http://localhost:52180', // Direct Indexing Demo
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============ Public Routes (before Clerk middleware) ============

// Basic route (public)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ZeroSum Server' });
});

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API status endpoint for financial API demo
app.get('/api/status', (req, res) => {
  const apis = {
    'ALPHA_VANTAGE_API_KEY': { configured: !!process.env.ALPHA_VANTAGE_API_KEY, rateLimit: '25/day' },
    'FINNHUB_API_KEY': { configured: !!process.env.FINNHUB_API_KEY, rateLimit: '60/min' },
    'TWELVE_DATA_API_KEY': { configured: !!process.env.TWELVE_DATA_API_KEY, rateLimit: '800/day' },
    'POLYGON_API_KEY': { configured: !!process.env.POLYGON_API_KEY, rateLimit: '5/min' },
    'FMP_API_KEY': { configured: !!process.env.FMP_API_KEY, rateLimit: '250/day' },
    'TIINGO_API_KEY': { configured: !!process.env.TIINGO_API_KEY, rateLimit: '50k/mo' },
    'FRED_API_KEY': { configured: !!process.env.FRED_API_KEY, rateLimit: 'unlimited' },
    'EXCHANGERATE_API_KEY': { configured: !!process.env.EXCHANGERATE_API_KEY, rateLimit: '1500/mo' },
    'NEWS_API_KEY': { configured: !!process.env.NEWS_API_KEY, rateLimit: '100/day' },
    'MARKETSTACK_API_KEY': { configured: !!process.env.MARKETSTACK_API_KEY, rateLimit: '100/mo' },
    'NASDAQ_DATA_LINK_API_KEY': { configured: !!process.env.NASDAQ_DATA_LINK_API_KEY, rateLimit: '50/day' },
  };
  res.json({
    status: 'ok',
    redis: redisCache ? 'connected' : 'not configured',
    apis
  });
});

// Initialize Clerk middleware - this adds auth info to all requests
app.use(clerkMiddleware());

// ============ Protected API Routes ============
// All routes below require authentication

// ============ SEC Filings Streaming Endpoint ============

// SSE endpoint for real-time SEC filings
app.get('/api/sec/stream', async (req, res) => {
  // Verify token from query param for SSE (can't use headers with EventSource)
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Verify the token with Clerk
  try {
    const result = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: ALLOWED_ORIGINS
    });
    if (!result || result.error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Token verification failed' });
  }

  if (!secClient) {
    return res.status(503).json({
      error: 'SEC feed not available',
      details: 'SEC client not initialized'
    });
  }

  // Get optional form type filter from query param
  const formType = req.query.formType || null;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Track this connection with its filter
  res.formTypeFilter = formType;
  secConnections.add(res);

  // Send initial filings (filtered if formType specified)
  try {
    const initialFilings = await secClient.getCachedFilings(0, 100, formType);
    res.write(`data: ${JSON.stringify({ type: 'initial', filings: initialFilings, formType })}\n\n`);
  } catch (error) {
    console.error('Error fetching initial SEC filings:', error.message);
  }

  // Set up heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    secConnections.delete(res);
    clearInterval(heartbeat);
  });
});

// Get recent SEC filings (non-streaming) with pagination
app.get('/api/sec/filings', requireAuth(), async (req, res) => {
  if (!secClient) {
    return res.status(503).json({
      error: 'SEC feed not available',
      details: 'SEC client not initialized'
    });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const formType = req.query.type || null; // e.g., '10-K', '8-K', '4'
    const filings = await secClient.getCachedFilings(offset, limit, formType);
    const total = await secClient.getCachedFilingsCount(formType);
    res.json({ filings, total, offset, limit, formType });
  } catch (error) {
    console.error('SEC filings error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch SEC filings',
      details: error.message
    });
  }
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

// ============ Graham Number Comparison Endpoint ============
// Compares Graham Number calculation across multiple data sources

app.get('/api/graham/compare/:symbol', requireAuth(), async (req, res) => {
  const { symbol } = req.params;

  const calculate = (eps, bvps) => {
    if (!eps || !bvps || eps <= 0 || bvps <= 0) return null;
    return parseFloat(Math.sqrt(22.5 * eps * bvps).toFixed(2));
  };

  const results = { symbol, strategies: {} };

  // Get current price from Yahoo (free, no key needed)
  try {
    const priceData = await yahooFinance.getQuote(symbol);
    results.price = priceData.regularMarketPrice;
  } catch (e) {
    results.price = null;
  }

  // Strategy 1: Finnhub
  try {
    if (finnhubClient) {
      const data = await finnhubClient.getBasicFinancials(symbol);
      const m = data.metric || {};
      const eps = m.epsAnnual;
      const bvps = m.bookValuePerShareAnnual;
      results.strategies.finnhub = { eps, bvps, graham: calculate(eps, bvps), error: null };
    } else {
      results.strategies.finnhub = { eps: null, bvps: null, graham: null, error: 'Not configured' };
    }
  } catch (e) {
    results.strategies.finnhub = { eps: null, bvps: null, graham: null, error: e.message };
  }

  // Strategy 2: FMP
  try {
    const apiKey = process.env.FMP_API_KEY;
    if (apiKey) {
      const resp = await axios.get(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${apiKey}`);
      const d = resp.data[0] || {};
      const eps = d.netIncomePerShareTTM;
      const bvps = d.bookValuePerShareTTM;
      results.strategies.fmp = { eps, bvps, graham: calculate(eps, bvps), error: null };
    } else {
      results.strategies.fmp = { eps: null, bvps: null, graham: null, error: 'Not configured' };
    }
  } catch (e) {
    results.strategies.fmp = { eps: null, bvps: null, graham: null, error: e.message };
  }

  // Strategy 3: Polygon
  try {
    const apiKey = process.env.POLYGON_API_KEY;
    if (apiKey) {
      const resp = await axios.get(`https://api.polygon.io/vX/reference/financials?ticker=${symbol}&limit=1&apiKey=${apiKey}`);
      const fin = resp.data.results?.[0]?.financials || {};
      const income = fin.income_statement || {};
      const balance = fin.balance_sheet || {};
      const eps = income.diluted_earnings_per_share?.value;
      const equity = balance.equity?.value;
      const shares = income.basic_average_shares?.value;
      const bvps = (equity && shares) ? equity / shares : null;
      results.strategies.polygon = { eps, bvps: bvps ? parseFloat(bvps.toFixed(2)) : null, graham: calculate(eps, bvps), error: null };
    } else {
      results.strategies.polygon = { eps: null, bvps: null, graham: null, error: 'Not configured' };
    }
  } catch (e) {
    results.strategies.polygon = { eps: null, bvps: null, graham: null, error: e.message };
  }

  // Strategy 4: Twelve Data
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (apiKey) {
      const [statsResp, balanceResp] = await Promise.all([
        axios.get(`https://api.twelvedata.com/statistics?symbol=${symbol}&apikey=${apiKey}`),
        axios.get(`https://api.twelvedata.com/balance_sheet?symbol=${symbol}&apikey=${apiKey}`)
      ]);
      const stats = statsResp.data.statistics?.valuations_metrics || {};
      const balance = balanceResp.data.balance_sheet?.[0] || {};
      const eps = stats.trailing_pe && results.price ? results.price / stats.trailing_pe : null;
      const equity = parseFloat(balance.total_shareholder_equity);
      const shares = parseFloat(balance.common_stock_shares_outstanding);
      const bvps = (equity && shares) ? equity / shares : null;
      results.strategies.twelvedata = { eps: eps ? parseFloat(eps.toFixed(2)) : null, bvps: bvps ? parseFloat(bvps.toFixed(2)) : null, graham: calculate(eps, bvps), error: null };
    } else {
      results.strategies.twelvedata = { eps: null, bvps: null, graham: null, error: 'Not configured' };
    }
  } catch (e) {
    results.strategies.twelvedata = { eps: null, bvps: null, graham: null, error: e.message };
  }

  res.json(results);
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

// ============ Yahoo Finance Endpoints ============

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

// ============ Alpha Vantage API Endpoints ============

const axios = require('axios');

// Alpha Vantage quote
app.get('/api/alphavantage/quote/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Alpha Vantage not configured', details: 'ALPHA_VANTAGE_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Alpha Vantage request failed', details: error.message });
  }
});

// Alpha Vantage time series
app.get('/api/alphavantage/timeseries/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Alpha Vantage not configured', details: 'ALPHA_VANTAGE_API_KEY not set' });
  }
  const { symbol } = req.params;
  const { interval } = req.query;
  try {
    const func = interval ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
    let url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${apiKey}`;
    if (interval) url += `&interval=${interval}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Alpha Vantage request failed', details: error.message });
  }
});

// ============ Twelve Data API Endpoints ============

// Twelve Data quote
app.get('/api/twelvedata/quote/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Twelve Data not configured', details: 'TWELVE_DATA_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Twelve Data request failed', details: error.message });
  }
});

// Twelve Data time series
app.get('/api/twelvedata/timeseries/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Twelve Data not configured', details: 'TWELVE_DATA_API_KEY not set' });
  }
  const { symbol } = req.params;
  const { interval, outputsize } = req.query;
  try {
    const response = await axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval || '1day'}&outputsize=${outputsize || 30}&apikey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Twelve Data request failed', details: error.message });
  }
});

// ============ Polygon.io API Endpoints ============

// Polygon quote (using existing client)
app.get('/api/polygon/quote/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Polygon not configured', details: 'POLYGON_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Polygon request failed', details: error.message });
  }
});

// Polygon ticker details
app.get('/api/polygon/details/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Polygon not configured', details: 'POLYGON_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Polygon request failed', details: error.message });
  }
});

// ============ Financial Modeling Prep (FMP) API Endpoints ============

// FMP quote
app.get('/api/fmp/quote/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'FMP not configured', details: 'FMP_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'FMP request failed', details: error.message });
  }
});

// FMP profile
app.get('/api/fmp/profile/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'FMP not configured', details: 'FMP_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'FMP request failed', details: error.message });
  }
});

// ============ Tiingo API Endpoints ============

// Tiingo quote
app.get('/api/tiingo/quote/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.TIINGO_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Tiingo not configured', details: 'TIINGO_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://api.tiingo.com/iex/${symbol}`, {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Tiingo request failed', details: error.message });
  }
});

// Tiingo meta (company info)
app.get('/api/tiingo/meta/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.TIINGO_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Tiingo not configured', details: 'TIINGO_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://api.tiingo.com/tiingo/daily/${symbol}`, {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Tiingo request failed', details: error.message });
  }
});

// ============ FRED API Endpoints ============

// FRED series data
app.get('/api/fred/series/:seriesId', requireAuth(), async (req, res) => {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'FRED not configured', details: 'FRED_API_KEY not set' });
  }
  const { seriesId } = req.params;
  const { limit } = req.query;
  try {
    const response = await axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=${limit || 100}&sort_order=desc`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'FRED request failed', details: error.message });
  }
});

// FRED series search
app.get('/api/fred/search', requireAuth(), async (req, res) => {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'FRED not configured', details: 'FRED_API_KEY not set' });
  }
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing required parameter: q' });
  }
  try {
    const response = await axios.get(`https://api.stlouisfed.org/fred/series/search?search_text=${encodeURIComponent(q)}&api_key=${apiKey}&file_type=json&limit=10`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'FRED request failed', details: error.message });
  }
});

// ============ ExchangeRate-API Endpoints ============

// Exchange rate latest
app.get('/api/exchangerate/latest/:base', requireAuth(), async (req, res) => {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ExchangeRate-API not configured', details: 'EXCHANGERATE_API_KEY not set' });
  }
  const { base } = req.params;
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'ExchangeRate-API request failed', details: error.message });
  }
});

// Exchange rate pair
app.get('/api/exchangerate/pair/:base/:target', requireAuth(), async (req, res) => {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ExchangeRate-API not configured', details: 'EXCHANGERATE_API_KEY not set' });
  }
  const { base, target } = req.params;
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${base}/${target}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'ExchangeRate-API request failed', details: error.message });
  }
});

// ============ NewsAPI Endpoints ============

// NewsAPI top headlines
app.get('/api/newsapi/headlines', requireAuth(), async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'NewsAPI not configured', details: 'NEWS_API_KEY not set' });
  }
  const { category, country, q } = req.query;
  try {
    let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}`;
    if (category) url += `&category=${category}`;
    if (country) url += `&country=${country}`;
    else url += '&country=us';
    if (q) url += `&q=${encodeURIComponent(q)}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'NewsAPI request failed', details: error.message });
  }
});

// NewsAPI business news
app.get('/api/newsapi/business', requireAuth(), async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'NewsAPI not configured', details: 'NEWS_API_KEY not set' });
  }
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&category=business&country=us`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'NewsAPI request failed', details: error.message });
  }
});

// ============ Marketstack API Endpoints ============

// Marketstack end-of-day data
app.get('/api/marketstack/eod/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.MARKETSTACK_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Marketstack not configured', details: 'MARKETSTACK_API_KEY not set' });
  }
  const { symbol } = req.params;
  const { limit } = req.query;
  try {
    const response = await axios.get(`http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=${symbol}&limit=${limit || 10}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Marketstack request failed', details: error.message });
  }
});

// Marketstack intraday
app.get('/api/marketstack/intraday/:symbol', requireAuth(), async (req, res) => {
  const apiKey = process.env.MARKETSTACK_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Marketstack not configured', details: 'MARKETSTACK_API_KEY not set' });
  }
  const { symbol } = req.params;
  try {
    const response = await axios.get(`http://api.marketstack.com/v1/intraday?access_key=${apiKey}&symbols=${symbol}&limit=10`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Marketstack request failed', details: error.message });
  }
});

// ============ Nasdaq Data Link API Endpoints ============

// Nasdaq Data Link dataset
app.get('/api/nasdaq/data/:database/:dataset', requireAuth(), async (req, res) => {
  const apiKey = process.env.NASDAQ_DATA_LINK_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Nasdaq Data Link not configured', details: 'NASDAQ_DATA_LINK_API_KEY not set' });
  }
  const { database, dataset } = req.params;
  const { limit } = req.query;
  try {
    const response = await axios.get(`https://data.nasdaq.com/api/v3/datasets/${database}/${dataset}.json?api_key=${apiKey}&limit=${limit || 10}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Nasdaq Data Link request failed', details: error.message });
  }
});

// Nasdaq Data Link tables (e.g., SHARADAR for fundamentals)
app.get('/api/nasdaq/tables/:vendor/:table', requireAuth(), async (req, res) => {
  const apiKey = process.env.NASDAQ_DATA_LINK_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Nasdaq Data Link not configured', details: 'NASDAQ_DATA_LINK_API_KEY not set' });
  }
  const { vendor, table } = req.params;
  const { ticker } = req.query;
  try {
    let url = `https://data.nasdaq.com/api/v3/datatables/${vendor}/${table}.json?api_key=${apiKey}`;
    if (ticker) url += `&ticker=${ticker}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Nasdaq Data Link request failed', details: error.message });
  }
});

// ============ Polygon.io Reference Data Endpoints ============

// Get all active NYSE common stocks
app.get('/api/stocks/nyse', requireAuth(), async (req, res) => {
  if (!polygonClient) {
    return res.status(503).json({
      error: 'Reference data not available',
      details: 'Polygon client not configured'
    });
  }

  try {
    const stocks = await polygonClient.getNYSECommonStocks();
    res.json({
      count: stocks.length,
      stocks
    });
  } catch (error) {
    console.error('NYSE stocks error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch NYSE stocks',
      details: error.response?.data || error.message
    });
  }
});

// ============ User Info Endpoint ============

// Get current user info (for debugging/display)
app.get('/api/user', requireAuth(), (req, res) => {
  const { userId } = getAuth(req);
  res.json({ userId });
});

// ============ Onboarding Data Endpoints ============

// Get saved onboarding data from Clerk private metadata
app.get('/api/onboarding', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const user = await clerkClient.users.getUser(userId);
    const onboardingData = user.privateMetadata?.onboarding || {};
    res.json(onboardingData);
  } catch (error) {
    console.error('Failed to get onboarding data:', error);
    res.status(500).json({
      error: 'Failed to get onboarding data',
      details: error.message
    });
  }
});

// Save onboarding data to Clerk private metadata
app.put('/api/onboarding', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const onboardingData = req.body;

  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        onboarding: onboardingData
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save onboarding data:', error);
    res.status(500).json({
      error: 'Failed to save onboarding data',
      details: error.message
    });
  }
});

// Submit final onboarding data (POST - for completion)
app.post('/api/onboarding', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const onboardingData = req.body;

  try {
    // Save to private metadata with completed flag
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        onboarding: {
          ...onboardingData,
          completedAt: new Date().toISOString()
        }
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to submit onboarding data:', error);
    res.status(500).json({
      error: 'Failed to submit onboarding data',
      details: error.message
    });
  }
});

// ============ Waitlist Endpoints ============

// Join the waitlist
app.post('/api/waitlist', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { plan } = req.body; // 'starter' or 'professional'

  try {
    // Get current user to preserve existing metadata
    const user = await clerkClient.users.getUser(userId);
    const existingMetadata = user.privateMetadata || {};

    // Update private metadata with waitlist info
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...existingMetadata,
        waitlist: {
          joined: true,
          plan: plan || 'starter',
          joinedAt: new Date().toISOString(),
          source: 'landing-page'
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully joined the waitlist',
      plan: plan || 'starter'
    });
  } catch (error) {
    console.error('Failed to join waitlist:', error);
    res.status(500).json({
      error: 'Failed to join waitlist',
      details: error.message
    });
  }
});

// Get waitlist status
app.get('/api/waitlist', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const user = await clerkClient.users.getUser(userId);
    const waitlistData = user.privateMetadata?.waitlist || null;

    res.json({
      onWaitlist: !!waitlistData?.joined,
      ...waitlistData
    });
  } catch (error) {
    console.error('Failed to get waitlist status:', error);
    res.status(500).json({
      error: 'Failed to get waitlist status',
      details: error.message
    });
  }
});

// ============ Admin Endpoints ============

// Get admin stats (waitlist + accounts)
app.get('/api/admin/stats', requireAuth(), async (req, res) => {
  try {
    // Get all users from Clerk
    const usersResponse = await clerkClient.users.getUserList({ limit: 500 });
    const users = usersResponse.data || [];

    // Count waitlist users and group by date
    const waitlistUsers = [];
    const waitlistByDate = {};

    for (const user of users) {
      const waitlist = user.privateMetadata?.waitlist;
      if (waitlist?.joined) {
        const joinedDate = waitlist.joinedAt ? waitlist.joinedAt.split('T')[0] : 'unknown';
        waitlistByDate[joinedDate] = (waitlistByDate[joinedDate] || 0) + 1;
        waitlistUsers.push({
          id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: waitlist.plan,
          joinedAt: waitlist.joinedAt,
        });
      }
    }

    // Get Alpaca accounts count
    let alpacaAccounts = [];
    let alpacaByDate = {};

    if (alpacaClient) {
      try {
        const accounts = await alpacaClient.getAllAccounts();
        alpacaAccounts = accounts || [];

        for (const account of alpacaAccounts) {
          const createdDate = account.created_at ? account.created_at.split('T')[0] : 'unknown';
          alpacaByDate[createdDate] = (alpacaByDate[createdDate] || 0) + 1;
        }
      } catch (err) {
        console.error('Failed to fetch Alpaca accounts:', err.message);
      }
    }

    // Convert to chart data format
    const allDates = [...new Set([...Object.keys(waitlistByDate), ...Object.keys(alpacaByDate)])].sort();

    let waitlistCumulative = 0;
    let alpacaCumulative = 0;
    const chartData = allDates.map(date => {
      waitlistCumulative += waitlistByDate[date] || 0;
      alpacaCumulative += alpacaByDate[date] || 0;
      return {
        date,
        waitlist: waitlistCumulative,
        alpaca: alpacaCumulative,
      };
    });

    // Format all Clerk users
    const allUsers = users.map(user => ({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      onWaitlist: !!user.privateMetadata?.waitlist?.joined,
      plan: user.privateMetadata?.waitlist?.plan || null,
      isAdmin: user.privateMetadata?.isAdmin === true,
      hasTradingAccess: user.privateMetadata?.hasTradingAccess === true,
      hasRetailApiAccess: user.privateMetadata?.hasRetailApiAccess === true,
    }));

    // Format Alpaca accounts
    const alpacaAccountsList = alpacaAccounts.map(acc => ({
      id: acc.id,
      email: acc.contact?.email_address,
      firstName: acc.identity?.given_name,
      lastName: acc.identity?.family_name,
      status: acc.status,
      createdAt: acc.created_at,
      accountNumber: acc.account_number,
    }));

    res.json({
      totalUsers: users.length,
      totalWaitlist: waitlistUsers.length,
      totalAlpacaAccounts: alpacaAccounts.length,
      waitlistUsers,
      allUsers,
      alpacaAccountsList,
      chartData,
    });
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    res.status(500).json({
      error: 'Failed to get admin stats',
      details: error.message
    });
  }
});

// Helper to check if user is admin
const isAdmin = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user.privateMetadata?.isAdmin === true;
  } catch {
    return false;
  }
};

// Middleware to require admin access
const requireAdmin = () => {
  return async (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };
};

// Bootstrap first admin (only works if no admins exist)
app.post('/api/admin/bootstrap', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    // Check if any admins exist
    const usersResponse = await clerkClient.users.getUserList({ limit: 500 });
    const users = usersResponse.data || [];
    const existingAdmins = users.filter(u => u.privateMetadata?.isAdmin === true);

    if (existingAdmins.length > 0) {
      return res.status(403).json({ error: 'Admin already exists. Use the admin panel to add more admins.' });
    }

    // Make current user the first admin
    const user = await clerkClient.users.getUser(userId);
    const existingMetadata = user.privateMetadata || {};

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...existingMetadata,
        isAdmin: true,
      }
    });

    console.log(`Bootstrapped first admin: ${userId}`);
    res.json({ success: true, message: 'You are now an admin' });
  } catch (error) {
    console.error('Failed to bootstrap admin:', error);
    res.status(500).json({ error: 'Failed to bootstrap admin', details: error.message });
  }
});

// Toggle admin status for a user
app.post('/api/admin/users/:targetUserId/admin', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { isAdmin: newAdminStatus } = req.body;

    const user = await clerkClient.users.getUser(targetUserId);
    const existingMetadata = user.privateMetadata || {};

    await clerkClient.users.updateUserMetadata(targetUserId, {
      privateMetadata: {
        ...existingMetadata,
        isAdmin: newAdminStatus === true,
      }
    });

    res.json({ success: true, isAdmin: newAdminStatus === true });
  } catch (error) {
    console.error('Failed to update admin status:', error);
    res.status(500).json({ error: 'Failed to update admin status', details: error.message });
  }
});

// Toggle trading access for a user
app.post('/api/admin/users/:targetUserId/trading', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { hasTradingAccess } = req.body;

    const user = await clerkClient.users.getUser(targetUserId);
    const existingMetadata = user.privateMetadata || {};

    await clerkClient.users.updateUserMetadata(targetUserId, {
      privateMetadata: {
        ...existingMetadata,
        hasTradingAccess: hasTradingAccess === true,
      }
    });

    res.json({ success: true, hasTradingAccess: hasTradingAccess === true });
  } catch (error) {
    console.error('Failed to update trading access:', error);
    res.status(500).json({ error: 'Failed to update trading access', details: error.message });
  }
});

// Toggle retail API access for a user (admin only)
app.post('/api/admin/users/:targetUserId/retail-api-access', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { hasRetailApiAccess } = req.body;

    const user = await clerkClient.users.getUser(targetUserId);
    const existingMetadata = user.privateMetadata || {};

    await clerkClient.users.updateUserMetadata(targetUserId, {
      privateMetadata: {
        ...existingMetadata,
        hasRetailApiAccess: hasRetailApiAccess === true,
      }
    });

    res.json({ success: true, hasRetailApiAccess: hasRetailApiAccess === true });
  } catch (error) {
    console.error('Failed to update retail API access:', error);
    res.status(500).json({ error: 'Failed to update retail API access', details: error.message });
  }
});

// Get all deletion requests (admin only)
app.get('/api/admin/deletion-requests', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const users = await clerkClient.users.getUserList({ limit: 500 });
    const requests = users.data
      .filter(u => u.privateMetadata?.deletionRequest?.status === 'pending')
      .map(u => ({
        userId: u.id,
        email: u.emailAddresses?.[0]?.emailAddress,
        firstName: u.firstName,
        lastName: u.lastName,
        requestedAt: u.privateMetadata.deletionRequest.requestedAt,
        reason: u.privateMetadata.deletionRequest.reason || null,
      }));

    res.json({ requests });
  } catch (error) {
    console.error('Failed to get deletion requests:', error);
    res.status(500).json({ error: 'Failed to get deletion requests', details: error.message });
  }
});

// Process deletion request (admin only)
app.post('/api/admin/deletion-requests/:targetUserId/action', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { action } = req.body; // 'approve' or 'deny'

    if (!['approve', 'deny'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "deny".' });
    }

    const user = await clerkClient.users.getUser(targetUserId);
    const existingMetadata = user.privateMetadata || {};

    if (!existingMetadata.deletionRequest) {
      return res.status(404).json({ error: 'No deletion request found for this user.' });
    }

    if (action === 'approve') {
      // Delete the user from Clerk
      await clerkClient.users.deleteUser(targetUserId);
      res.json({ success: true, action: 'approved', message: 'User has been deleted.' });
    } else {
      // Deny the request - update status
      await clerkClient.users.updateUserMetadata(targetUserId, {
        privateMetadata: {
          ...existingMetadata,
          deletionRequest: {
            ...existingMetadata.deletionRequest,
            status: 'denied',
            processedAt: new Date().toISOString(),
          }
        }
      });
      res.json({ success: true, action: 'denied', message: 'Deletion request has been denied.' });
    }
  } catch (error) {
    console.error('Failed to process deletion request:', error);
    res.status(500).json({ error: 'Failed to process deletion request', details: error.message });
  }
});

// ============ User Settings Endpoints ============

// Get current user's settings and permissions
app.get('/api/user/settings', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);

    res.json({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      hasRetailApiAccess: user.privateMetadata?.hasRetailApiAccess === true,
      hasTradingAccess: user.privateMetadata?.hasTradingAccess === true,
      deletionRequest: user.privateMetadata?.deletionRequest || null,
    });
  } catch (error) {
    console.error('Failed to get user settings:', error);
    res.status(500).json({ error: 'Failed to get user settings', details: error.message });
  }
});

// Request account deletion
app.post('/api/user/request-deletion', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { reason } = req.body;

    const user = await clerkClient.users.getUser(userId);
    const existingMetadata = user.privateMetadata || {};

    // Check if there's already a pending request
    if (existingMetadata.deletionRequest?.status === 'pending') {
      return res.status(400).json({ error: 'You already have a pending deletion request.' });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...existingMetadata,
        deletionRequest: {
          requestedAt: new Date().toISOString(),
          reason: reason || null,
          status: 'pending',
        }
      }
    });

    res.json({ success: true, message: 'Deletion request submitted successfully.' });
  } catch (error) {
    console.error('Failed to submit deletion request:', error);
    res.status(500).json({ error: 'Failed to submit deletion request', details: error.message });
  }
});

// Cancel deletion request
app.delete('/api/user/request-deletion', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const user = await clerkClient.users.getUser(userId);
    const existingMetadata = user.privateMetadata || {};

    if (!existingMetadata.deletionRequest || existingMetadata.deletionRequest.status !== 'pending') {
      return res.status(400).json({ error: 'No pending deletion request to cancel.' });
    }

    const { deletionRequest, ...restMetadata } = existingMetadata;

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: restMetadata
    });

    res.json({ success: true, message: 'Deletion request cancelled.' });
  } catch (error) {
    console.error('Failed to cancel deletion request:', error);
    res.status(500).json({ error: 'Failed to cancel deletion request', details: error.message });
  }
});

// ============ User API Key Endpoints ============
// These endpoints allow users to store their personal Alpaca retail API keys in Clerk metadata

// Enable retail API access for current user (self-service for development)
app.post('/api/user/enable-retail-api', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    const existingMetadata = user.privateMetadata || {};

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...existingMetadata,
        hasRetailApiAccess: true,
      }
    });

    res.json({ success: true, message: 'Retail API access enabled.' });
  } catch (error) {
    console.error('Failed to enable retail API access:', error);
    res.status(500).json({ error: 'Failed to enable retail API access', details: error.message });
  }
});

// List user's stored API keys
app.get('/api/user/api-keys', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);

    // Check if user has retail API access
    if (!user.privateMetadata?.hasRetailApiAccess) {
      return res.status(403).json({ error: 'You do not have retail API access.' });
    }

    // Get stored API keys from Clerk metadata (secrets are masked)
    const storedKeys = user.privateMetadata?.retailApiKeys || [];

    // Return keys with masked secrets
    const keys = storedKeys.map(key => ({
      id: key.id,
      name: key.name,
      apiKeyId: key.apiKeyId,
      secretLastFour: key.secretLastFour,
      createdAt: key.createdAt,
    }));

    res.json({ keys });
  } catch (error) {
    console.error('Failed to list API keys:', error);
    res.status(500).json({ error: 'Failed to list API keys', details: error.message });
  }
});

// Get all individual accounts with Alpaca account info
app.get('/api/user/individual-accounts', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    console.log('[individual-accounts] Fetching accounts for user:', userId);

    // Check if user has retail API access
    if (!user.privateMetadata?.hasRetailApiAccess) {
      console.log('[individual-accounts] User does not have retail API access');
      return res.status(403).json({ error: 'Retail API access not enabled' });
    }

    const storedKeys = user.privateMetadata?.retailApiKeys || [];
    console.log('[individual-accounts] Found', storedKeys.length, 'stored keys');
    if (storedKeys.length === 0) {
      return res.json({ accounts: [] });
    }

    // Fetch account info for each stored key
    const accounts = await Promise.all(
      storedKeys.map(async (key) => {
        console.log('[individual-accounts] Fetching account for key:', key.apiKeyId);
        try {
          // Decrypt the API secret if encryption is configured
          let apiSecret = key.apiSecret;
          if (isEncryptionConfigured() && apiSecret) {
            try {
              apiSecret = decrypt(apiSecret);
              console.log('[individual-accounts] Decrypted secret successfully');
            } catch (e) {
              console.log('[individual-accounts] Using unencrypted secret (decryption failed)');
              // If decryption fails, assume it's not encrypted (legacy data)
            }
          }

          const client = new IndividualAlpacaClient(key.apiKeyId, apiSecret, true);
          const account = await client.getAccount();
          console.log('[individual-accounts] Got account:', account.account_number, account.status);

          return {
            keyId: key.id,
            name: key.name,
            apiKeyId: key.apiKeyId,
            accountNumber: account.account_number,
            status: account.status,
            portfolioValue: account.portfolio_value,
            cash: account.cash,
            buyingPower: account.buying_power,
          };
        } catch (error) {
          console.error('[individual-accounts] Error fetching account for key:', key.apiKeyId, error.message);
          // Return error info for this key but don't fail the whole request
          return {
            keyId: key.id,
            name: key.name,
            apiKeyId: key.apiKeyId,
            error: error.message || 'Failed to fetch account',
          };
        }
      })
    );

    // Return active key ID from metadata
    const activeKeyId = user.privateMetadata?.activeRetailKeyId || (storedKeys[0]?.id || null);
    console.log('[individual-accounts] Returning', accounts.length, 'accounts, activeKeyId:', activeKeyId);

    res.json({ accounts, activeKeyId });
  } catch (error) {
    console.error('Failed to get individual accounts:', error);
    res.status(500).json({ error: 'Failed to get individual accounts', details: error.message });
  }
});

// Set active retail API key
app.post('/api/user/set-active-key', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { keyId } = req.body;

    if (!keyId) {
      return res.status(400).json({ error: 'keyId is required' });
    }

    const user = await clerkClient.users.getUser(userId);

    // Check if user has retail API access
    if (!user.privateMetadata?.hasRetailApiAccess) {
      return res.status(403).json({ error: 'Retail API access not enabled' });
    }

    const storedKeys = user.privateMetadata?.retailApiKeys || [];

    // Verify the keyId exists
    if (!storedKeys.some(k => k.id === keyId)) {
      return res.status(400).json({ error: 'Invalid key ID' });
    }

    // Update active key in metadata
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        activeRetailKeyId: keyId,
      }
    });

    res.json({ success: true, activeKeyId: keyId });
  } catch (error) {
    console.error('Failed to set active key:', error);
    res.status(500).json({ error: 'Failed to set active key', details: error.message });
  }
});

// Add a new API key (user provides their own Alpaca retail API credentials)
app.post('/api/user/api-keys', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { name, apiKeyId, apiSecret } = req.body;

    if (!apiKeyId || !apiSecret) {
      return res.status(400).json({ error: 'API Key ID and Secret are required.' });
    }

    const user = await clerkClient.users.getUser(userId);

    // Check if user has retail API access
    if (!user.privateMetadata?.hasRetailApiAccess) {
      return res.status(403).json({ error: 'You do not have retail API access.' });
    }

    const existingMetadata = user.privateMetadata || {};
    const existingKeys = existingMetadata.retailApiKeys || [];

    // Check for duplicate API Key ID
    if (existingKeys.some(k => k.apiKeyId === apiKeyId)) {
      return res.status(400).json({ error: 'This API Key ID is already stored.' });
    }

    // Create new key entry
    const newKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name || 'Alpaca API Key',
      apiKeyId: apiKeyId,
      apiSecret: apiSecret, // Stored securely in Clerk's private metadata
      secretLastFour: apiSecret.slice(-4),
      createdAt: new Date().toISOString(),
    };

    // Add to metadata
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...existingMetadata,
        retailApiKeys: [...existingKeys, newKey],
      }
    });

    res.json({
      success: true,
      key: {
        id: newKey.id,
        name: newKey.name,
        apiKeyId: newKey.apiKeyId,
        secretLastFour: newKey.secretLastFour,
        createdAt: newKey.createdAt,
      }
    });
  } catch (error) {
    console.error('Failed to add API key:', error);
    res.status(500).json({ error: 'Failed to add API key', details: error.message });
  }
});

// Delete stored API key
app.delete('/api/user/api-keys/:keyId', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { keyId } = req.params;
    const user = await clerkClient.users.getUser(userId);

    // Check if user has retail API access
    if (!user.privateMetadata?.hasRetailApiAccess) {
      return res.status(403).json({ error: 'You do not have retail API access.' });
    }

    const existingMetadata = user.privateMetadata || {};
    const existingKeys = existingMetadata.retailApiKeys || [];

    // Find and remove the key
    const keyIndex = existingKeys.findIndex(k => k.id === keyId);
    if (keyIndex === -1) {
      return res.status(404).json({ error: 'API key not found.' });
    }

    const updatedKeys = existingKeys.filter(k => k.id !== keyId);

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...existingMetadata,
        retailApiKeys: updatedKeys,
      }
    });

    res.json({ success: true, message: 'API key deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete API key:', error);
    res.status(500).json({ error: 'Failed to delete API key', details: error.message });
  }
});

// ============ Individual Account Endpoints (uses user's retail API keys) ============

// Helper function to get user's individual Alpaca client
async function getIndividualClient(userId) {
  const user = await clerkClient.users.getUser(userId);
  const privateMetadata = user.privateMetadata || {};

  if (!privateMetadata.hasRetailApiAccess) {
    throw new Error('Retail API access not enabled');
  }

  const retailApiKeys = privateMetadata.retailApiKeys || [];
  if (retailApiKeys.length === 0) {
    throw new Error('No API keys configured');
  }

  // Use the active key from metadata, or fall back to first key
  const activeKeyId = privateMetadata.activeRetailKeyId;
  let activeKey = retailApiKeys[0]; // Default to first key

  if (activeKeyId) {
    const found = retailApiKeys.find(k => k.id === activeKeyId);
    if (found) {
      activeKey = found;
    }
  }

  // Decrypt the API secret if encryption is configured
  let apiSecret = activeKey.apiSecret;
  if (isEncryptionConfigured() && apiSecret) {
    try {
      apiSecret = decrypt(apiSecret);
    } catch (e) {
      // If decryption fails, assume it's not encrypted (legacy data)
      console.log('Using unencrypted API secret');
    }
  }

  return new IndividualAlpacaClient(activeKey.apiKeyId, apiSecret, true);
}

// Get individual account info
app.get('/api/individual/account', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const client = await getIndividualClient(userId);
    const account = await client.getAccount();

    res.json({
      id: account.id,
      accountNumber: account.account_number,
      status: account.status,
      currency: account.currency,
      cashBalance: account.cash,
      portfolioValue: account.portfolio_value,
      buyingPower: account.buying_power,
      equity: account.equity,
      lastEquity: account.last_equity,
      longMarketValue: account.long_market_value,
      shortMarketValue: account.short_market_value,
      daytradeCount: account.daytrade_count,
      patternDayTrader: account.pattern_day_trader,
      tradingBlocked: account.trading_blocked,
      transfersBlocked: account.transfers_blocked,
      accountBlocked: account.account_blocked,
      createdAt: account.created_at,
    });
  } catch (error) {
    console.error('Failed to get individual account:', error);
    if (error.message === 'Retail API access not enabled' || error.message === 'No API keys configured') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get account', details: error.message });
  }
});

// Get individual positions
app.get('/api/individual/positions', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const client = await getIndividualClient(userId);
    const positions = await client.getPositions();

    res.json(positions.map(p => ({
      assetId: p.asset_id,
      symbol: p.symbol,
      exchange: p.exchange,
      assetClass: p.asset_class,
      qty: p.qty,
      avgEntryPrice: p.avg_entry_price,
      side: p.side,
      marketValue: p.market_value,
      costBasis: p.cost_basis,
      unrealizedPL: p.unrealized_pl,
      unrealizedPLPercent: p.unrealized_plpc,
      currentPrice: p.current_price,
      lastdayPrice: p.lastday_price,
      changeToday: p.change_today,
    })));
  } catch (error) {
    console.error('Failed to get individual positions:', error);
    if (error.message === 'Retail API access not enabled' || error.message === 'No API keys configured') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get positions', details: error.message });
  }
});

// Get individual orders
app.get('/api/individual/orders', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const status = req.query.status || 'all';
  const limit = parseInt(req.query.limit) || 100;

  try {
    const client = await getIndividualClient(userId);
    const orders = await client.getOrders(status, limit);

    res.json(orders.map(o => ({
      id: o.id,
      clientOrderId: o.client_order_id,
      symbol: o.symbol,
      assetClass: o.asset_class,
      qty: o.qty,
      filledQty: o.filled_qty,
      side: o.side,
      type: o.type,
      timeInForce: o.time_in_force,
      limitPrice: o.limit_price,
      stopPrice: o.stop_price,
      filledAvgPrice: o.filled_avg_price,
      status: o.status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      submittedAt: o.submitted_at,
      filledAt: o.filled_at,
      canceledAt: o.canceled_at,
      expiredAt: o.expired_at,
    })));
  } catch (error) {
    console.error('Failed to get individual orders:', error);
    if (error.message === 'Retail API access not enabled' || error.message === 'No API keys configured') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get orders', details: error.message });
  }
});

// Place order on individual account
app.post('/api/individual/orders', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { symbol, qty, side, type, time_in_force, limit_price, stop_price, notional } = req.body;

  if (!symbol || !side || !type) {
    return res.status(400).json({ error: 'Missing required fields: symbol, side, type' });
  }

  if (!qty && !notional) {
    return res.status(400).json({ error: 'Must specify either qty or notional' });
  }

  try {
    const client = await getIndividualClient(userId);

    const orderData = {
      symbol: symbol.toUpperCase(),
      side, // 'buy' or 'sell'
      type, // 'market', 'limit', 'stop', 'stop_limit'
      time_in_force: time_in_force || 'day',
    };

    if (qty) orderData.qty = String(qty);
    if (notional) orderData.notional = String(notional);
    if (limit_price) orderData.limit_price = String(limit_price);
    if (stop_price) orderData.stop_price = String(stop_price);

    const order = await client.placeOrder(orderData);

    res.json({
      id: order.id,
      clientOrderId: order.client_order_id,
      symbol: order.symbol,
      qty: order.qty,
      side: order.side,
      type: order.type,
      timeInForce: order.time_in_force,
      limitPrice: order.limit_price,
      stopPrice: order.stop_price,
      status: order.status,
      createdAt: order.created_at,
      submittedAt: order.submitted_at,
    });
  } catch (error) {
    console.error('Failed to place order:', error);
    if (error.message === 'Retail API access not enabled' || error.message === 'No API keys configured') {
      return res.status(403).json({ error: error.message });
    }
    // Return Alpaca's error message if available
    const alpacaError = error.response?.data;
    if (alpacaError) {
      return res.status(400).json({ error: alpacaError.message || 'Order failed', details: alpacaError });
    }
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
});

// Cancel order on individual account
app.delete('/api/individual/orders/:orderId', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { orderId } = req.params;

  try {
    const client = await getIndividualClient(userId);
    await client.cancelOrder(orderId);

    res.json({ success: true, message: 'Order canceled' });
  } catch (error) {
    console.error('Failed to cancel order:', error);
    if (error.message === 'Retail API access not enabled' || error.message === 'No API keys configured') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to cancel order', details: error.message });
  }
});

// Get individual portfolio history
app.get('/api/individual/portfolio/history', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const period = req.query.period || '1M';
  const timeframe = req.query.timeframe || '1D';

  try {
    const client = await getIndividualClient(userId);
    const history = await client.getPortfolioHistory(period, timeframe);

    res.json(history);
  } catch (error) {
    console.error('Failed to get portfolio history:', error);
    if (error.message === 'Retail API access not enabled' || error.message === 'No API keys configured') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get portfolio history', details: error.message });
  }
});

// Get individual account activities (cash events, dividends, etc.)
app.get('/api/individual/activities', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { activity_types, after, until } = req.query;

  try {
    const client = await getIndividualClient(userId);
    const activities = await client.getActivities(activity_types, after, until);

    res.json(activities);
  } catch (error) {
    console.error('Failed to get account activities:', error);
    if (error.message === 'Retail API access not enabled' || error.message === 'No API keys configured') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get account activities', details: error.message });
  }
});

// Get user's private metadata (admin only)
app.get('/api/admin/users/:targetUserId/metadata', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const user = await clerkClient.users.getUser(targetUserId);

    res.json({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      privateMetadata: user.privateMetadata || {},
      publicMetadata: user.publicMetadata || {},
    });
  } catch (error) {
    console.error('Failed to get user metadata:', error);
    res.status(500).json({ error: 'Failed to get user metadata', details: error.message });
  }
});

// ============ Alpaca Account Endpoints ============

// Get Alpaca account details
app.get('/api/account', requireAuth(), async (req, res) => {
  console.log('[/api/account] Request received');

  if (!alpacaClient) {
    console.log('[/api/account] Alpaca client not configured');
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { userId } = getAuth(req);
  console.log('[/api/account] User ID:', userId);

  try {
    // Get user email from Clerk
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;
    console.log('[/api/account] User email:', email);

    if (!email) {
      console.log('[/api/account] No email found for user');
      return res.status(400).json({ error: 'No email found for user' });
    }

    console.log('[/api/account] Looking up Alpaca account for email:', email);
    const account = await alpacaClient.getAccountByEmail(email);
    console.log('[/api/account] Alpaca account result:', account ? `Found (id: ${account.id})` : 'Not found');

    if (!account) {
      console.log('[/api/account] No Alpaca account found for email:', email);
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    // Get full trading account details
    console.log('[/api/account] Fetching trading account for:', account.id);
    const tradingAccount = await alpacaClient.getTradingAccount(account.id);
    console.log('[/api/account] Trading account result:', tradingAccount ? 'Found' : 'Not found');

    const response = {
      id: account.id,
      accountNumber: account.account_number,
      status: account.status,
      currency: tradingAccount?.currency || 'USD',
      cashBalance: tradingAccount?.cash || '0',
      portfolioValue: tradingAccount?.portfolio_value || '0',
      buyingPower: tradingAccount?.buying_power || '0',
      equity: tradingAccount?.equity || '0',
      lastEquity: tradingAccount?.last_equity || '0',
      createdAt: account.created_at,
    };
    console.log('[/api/account] Sending response:', JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error('[/api/account] Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get account',
      details: error.response?.data || error.message
    });
  }
});

// Get historical cash balance reconstructed from account activities (chart-friendly)
app.get('/api/account/cash-history', requireAuth(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { userId } = getAuth(req);

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return res.status(400).json({ error: 'No email found for user' });
    }

    const account = await alpacaClient.getAccountByEmail(email);

    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    // Fetch current cash and all activities in parallel
    const [tradingAccount, activities] = await Promise.all([
      alpacaClient.getTradingAccount(account.id),
      alpacaClient.getAccountActivities(account.id)
    ]);

    const currentCash = parseFloat(tradingAccount?.cash || '0');

    // Sort activities chronologically (oldest first)
    const sortedActivities = activities.sort((a, b) =>
      new Date(a.transaction_time || a.date).getTime() - new Date(b.transaction_time || b.date).getTime()
    );

    // Build chart data arrays
    const timestamps = [];
    const values = [];
    const events = [];
    let runningCash = 0;

    for (const activity of sortedActivities) {
      const timestamp = new Date(activity.transaction_time || activity.date).getTime();
      let change = 0;
      let label = '';
      let eventType = activity.activity_type;

      if (activity.activity_type === 'FILL') {
        const qty = parseFloat(activity.qty || '0');
        const price = parseFloat(activity.price || '0');
        const side = activity.side;

        if (side === 'buy') {
          change = -(qty * price);
          label = `Buy ${activity.symbol}`;
        } else if (side === 'sell') {
          change = qty * price;
          label = `Sell ${activity.symbol}`;
        }
      } else if (activity.net_amount !== undefined) {
        change = parseFloat(activity.net_amount);

        switch (activity.activity_type) {
          case 'CSD':
          case 'TRANS':
            label = change > 0 ? 'Deposit' : 'Withdrawal';
            break;
          case 'DIV':
            label = `Dividend`;
            break;
          case 'INT':
            label = 'Interest';
            break;
          case 'FEE':
            label = 'Fee';
            break;
          default:
            label = activity.activity_type || 'Other';
        }
      }

      runningCash += change;

      // Add data point
      timestamps.push(timestamp);
      values.push(Math.round(runningCash * 100) / 100);

      // Add event for annotations
      events.push({
        timestamp,
        value: Math.round(runningCash * 100) / 100,
        change: Math.round(change * 100) / 100,
        type: eventType,
        label,
        symbol: activity.symbol || null
      });
    }

    // Add current point
    const now = Date.now();
    timestamps.push(now);
    values.push(currentCash);

    // Calculate stats
    const minCash = Math.min(...values);
    const maxCash = Math.max(...values);
    const startCash = values[0] || 0;
    const totalChange = currentCash - startCash;
    const percentChange = startCash > 0 ? (totalChange / startCash) * 100 : 0;

    res.json({
      // Chart data arrays (parallel arrays for easy plotting)
      timestamps,
      values,

      // Event markers for annotations
      events,

      // Summary stats
      current: currentCash,
      min: minCash,
      max: maxCash,
      start: startCash,
      change: Math.round(totalChange * 100) / 100,
      changePercent: Math.round(percentChange * 100) / 100,

      // Metadata
      count: activities.length,
      startDate: timestamps[0] ? new Date(timestamps[0]).toISOString() : null,
      endDate: new Date(now).toISOString()
    });
  } catch (error) {
    console.error('Cash history error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get cash history',
      details: error.response?.data || error.message
    });
  }
});

// Get user's open positions
app.get('/api/positions', requireAuth(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { userId } = getAuth(req);

  try {
    // Get user email from Clerk
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return res.status(400).json({ error: 'No email found for user' });
    }

    const account = await alpacaClient.getAccountByEmail(email);

    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    // Fetch positions and filled orders in parallel
    const [positions, orders] = await Promise.all([
      alpacaClient.getPositions(account.id),
      alpacaClient.getOrders(account.id, 'closed', 500)
    ]);

    // Filter to only filled buy orders and group by symbol
    const filledBuyOrders = orders
      .filter(order => order.status === 'filled' && order.side === 'buy')
      .sort((a, b) => new Date(b.filled_at) - new Date(a.filled_at));

    // Create a map of symbol to most recent filled order
    const symbolToFilledOrder = {};
    for (const order of filledBuyOrders) {
      if (!symbolToFilledOrder[order.symbol]) {
        symbolToFilledOrder[order.symbol] = order;
      }
    }

    // Format positions for frontend with filled date
    const formattedPositions = positions.map(pos => {
      const filledOrder = symbolToFilledOrder[pos.symbol];
      return {
        symbol: pos.symbol,
        qty: pos.qty,
        side: pos.side,
        marketValue: pos.market_value,
        costBasis: pos.cost_basis,
        unrealizedPL: pos.unrealized_pl,
        unrealizedPLPercent: pos.unrealized_plpc,
        currentPrice: pos.current_price,
        avgEntryPrice: pos.avg_entry_price,
        assetId: pos.asset_id,
        assetClass: pos.asset_class,
        filledAt: filledOrder?.filled_at || null,
      };
    });

    res.json(formattedPositions);
  } catch (error) {
    console.error('Positions error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get positions',
      details: error.response?.data || error.message
    });
  }
});

// Get portfolio history
app.get('/api/portfolio/history', requireAuth(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { userId } = getAuth(req);
  const { period = '1M', timeframe = '1D' } = req.query;

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return res.status(400).json({ error: 'No email found for user' });
    }

    const account = await alpacaClient.getAccountByEmail(email);

    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    const history = await alpacaClient.getPortfolioHistory(account.id, period, timeframe);

    if (!history) {
      return res.json({ timestamp: [], equity: [], profit_loss: [], profit_loss_pct: [] });
    }

    res.json(history);
  } catch (error) {
    console.error('Portfolio history error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get portfolio history',
      details: error.response?.data || error.message
    });
  }
});

// Get stacked portfolio history (positions breakdown over time)
app.get('/api/portfolio/stacked-history', requireAuth(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { userId } = getAuth(req);
  const { period = '1M', timeframe = '1D' } = req.query;

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return res.status(400).json({ error: 'No email found for user' });
    }

    const account = await alpacaClient.getAccountByEmail(email);

    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    // Fetch all data in parallel
    const [history, positions, orders, tradingAccount] = await Promise.all([
      alpacaClient.getPortfolioHistory(account.id, period, timeframe),
      alpacaClient.getPositions(account.id),
      alpacaClient.getOrders(account.id, 'filled', 500),
      alpacaClient.getTradingAccount(account.id)
    ]);

    if (!history || !history.timestamp || history.timestamp.length === 0) {
      return res.json({ data: [], positions: [], purchases: [] });
    }

    const startTime = history.timestamp[0] * 1000;
    const endTime = history.timestamp[history.timestamp.length - 1] * 1000;
    const cashBalance = parseFloat(tradingAccount?.cash || '0');

    // Build position timeline from orders
    // Track when each position was active and its cost basis
    const positionTimeline = new Map(); // symbol -> [{startTime, endTime, qty, costBasis}]

    // Process orders chronologically to build position history
    const sortedOrders = orders
      .filter(o => o.filled_at)
      .sort((a, b) => new Date(a.filled_at).getTime() - new Date(b.filled_at).getTime());

    const runningPositions = new Map(); // symbol -> {qty, totalCost}

    for (const order of sortedOrders) {
      const symbol = order.symbol;
      const qty = parseFloat(order.filled_qty || order.qty);
      const price = parseFloat(order.filled_avg_price);
      const orderTime = new Date(order.filled_at).getTime();

      if (!runningPositions.has(symbol)) {
        runningPositions.set(symbol, { qty: 0, totalCost: 0 });
      }

      const pos = runningPositions.get(symbol);

      if (order.side === 'buy') {
        pos.qty += qty;
        pos.totalCost += qty * price;
      } else if (order.side === 'sell') {
        // Reduce position proportionally
        if (pos.qty > 0) {
          const avgCost = pos.totalCost / pos.qty;
          pos.qty -= qty;
          pos.totalCost = pos.qty * avgCost;
        }
      }

      if (!positionTimeline.has(symbol)) {
        positionTimeline.set(symbol, []);
      }
      positionTimeline.get(symbol).push({
        time: orderTime,
        qty: pos.qty,
        avgCost: pos.qty > 0 ? pos.totalCost / pos.qty : 0,
        totalCost: pos.totalCost
      });
    }

    // Get unique symbols that were ever held
    const allSymbols = Array.from(positionTimeline.keys());

    // Fetch historical prices for all symbols in parallel
    const priceHistoryMap = new Map();
    if (allSymbols.length > 0 && yahooFinance) {
      // Map period to Yahoo Finance range
      const rangeMap = {
        '1D': '1d',
        '1W': '5d',
        '1M': '1mo',
        '3M': '3mo',
        '1A': '1y',
        'all': '5y'
      };
      const intervalMap = {
        '5Min': '5m',
        '15Min': '15m',
        '1H': '1h',
        '1D': '1d'
      };
      const range = rangeMap[period] || '1mo';
      const interval = intervalMap[timeframe] || '1d';

      const pricePromises = allSymbols.map(async (symbol) => {
        try {
          const priceData = await yahooFinance.getHistory(symbol, { range, interval });
          return { symbol, data: priceData };
        } catch (err) {
          console.error(`Failed to fetch price history for ${symbol}:`, err.message);
          return { symbol, data: [] };
        }
      });

      const priceResults = await Promise.all(pricePromises);
      for (const { symbol, data } of priceResults) {
        priceHistoryMap.set(symbol, data);
      }
    }

    // Current position market values for final distribution
    const currentPositionValues = new Map();
    let totalCurrentPositionValue = 0;
    for (const pos of positions) {
      const marketValue = parseFloat(pos.market_value || '0');
      currentPositionValues.set(pos.symbol, {
        marketValue,
        qty: parseFloat(pos.qty),
        currentPrice: parseFloat(pos.current_price)
      });
      totalCurrentPositionValue += marketValue;
    }

    // Build stacked chart data
    const stackedData = history.timestamp.map((ts, i) => {
      const timestamp = ts * 1000;
      const equity = history.equity[i] || 0;
      const profitLoss = history.profit_loss[i] || 0;
      const profitLossPct = (history.profit_loss_pct[i] || 0) * 100;

      // Calculate position values at this timestamp
      const dataPoint = {
        timestamp,
        equity,
        profitLoss,
        profitLossPct,
        cash: 0
      };

      let positionsValue = 0;

      // For each symbol, find the position state at this timestamp
      for (const symbol of allSymbols) {
        const timeline = positionTimeline.get(symbol);
        let posState = { qty: 0, totalCost: 0 };

        // Find the most recent position state before/at this timestamp
        for (const entry of timeline) {
          if (entry.time <= timestamp) {
            posState = entry;
          } else {
            break;
          }
        }

        if (posState.qty > 0) {
          // Estimate current value using cost basis and overall portfolio performance
          // This is an approximation since we don't have historical prices
          const currentPosData = currentPositionValues.get(symbol);
          let estimatedValue = posState.totalCost;

          if (currentPosData && currentPosData.qty > 0) {
            // Scale by the portfolio's overall performance ratio
            const performanceRatio = equity / (history.equity[history.equity.length - 1] || equity);
            estimatedValue = currentPosData.marketValue * performanceRatio;

            // Adjust for position size changes
            const qtyRatio = posState.qty / currentPosData.qty;
            estimatedValue *= qtyRatio;
          }

          dataPoint[symbol] = Math.max(0, estimatedValue);
          positionsValue += dataPoint[symbol];
        } else {
          dataPoint[symbol] = 0;
        }
      }

      // Cash is equity minus all position values
      dataPoint.cash = Math.max(0, equity - positionsValue);

      return dataPoint;
    });

    // Build purchase events for markers
    const purchases = sortedOrders
      .filter(o => o.side === 'buy' && o.filled_at)
      .filter(o => {
        const orderTime = new Date(o.filled_at).getTime();
        return orderTime >= startTime && orderTime <= endTime;
      })
      .map(o => ({
        symbol: o.symbol,
        qty: o.filled_qty || o.qty,
        price: o.filled_avg_price,
        time: new Date(o.filled_at).getTime(),
        date: new Date(o.filled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));

    // Convert priceHistoryMap to object for JSON response
    const priceHistory = {};
    for (const [symbol, data] of priceHistoryMap) {
      priceHistory[symbol] = data.map(d => ({
        timestamp: d.timestamp,
        close: d.close
      }));
    }

    res.json({
      data: stackedData,
      symbols: allSymbols,
      purchases,
      currentCash: cashBalance,
      positions: positions.map(p => ({
        symbol: p.symbol,
        qty: p.qty,
        marketValue: p.market_value,
        currentPrice: p.current_price
      })),
      priceHistory
    });
  } catch (error) {
    console.error('Stacked portfolio history error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get stacked portfolio history',
      details: error.response?.data || error.message
    });
  }
});

// Get order history (for purchase points on chart)
app.get('/api/orders', requireAuth(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { userId } = getAuth(req);
  const { status = 'filled', limit = 100 } = req.query;

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return res.status(400).json({ error: 'No email found for user' });
    }

    const account = await alpacaClient.getAccountByEmail(email);

    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    const orders = await alpacaClient.getOrders(account.id, status, parseInt(limit));

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      qty: order.qty,
      filledQty: order.filled_qty,
      filledAvgPrice: order.filled_avg_price,
      status: order.status,
      submittedAt: order.submitted_at,
      filledAt: order.filled_at,
      createdAt: order.created_at,
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Orders error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get orders',
      details: error.response?.data || error.message
    });
  }
});

// ============ Watchlist Endpoints ============

// Helper to get user's Alpaca account
async function getUserAlpacaAccount(userId) {
  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;
  return alpacaClient.getAccountByEmail(email);
}

// Get user's default watchlist (creates one if none exists)
app.get('/api/watchlist', requireAuth(), async (req, res) => {
  console.log('[Watchlist GET] Request received');
  if (!alpacaClient) {
    return res.status(503).json({ error: 'Alpaca not available' });
  }

  const { userId } = getAuth(req);

  try {
    const account = await getUserAlpacaAccount(userId);
    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    console.log('[Watchlist GET] Fetching watchlists for account:', account.id);
    let watchlists = await alpacaClient.getWatchlists(account.id);
    console.log('[Watchlist GET] Found watchlists:', watchlists.length);

    // Find or create a default watchlist
    let defaultWatchlistInfo = watchlists.find(w => w.name === 'Default');
    if (!defaultWatchlistInfo && watchlists.length > 0) {
      defaultWatchlistInfo = watchlists[0];
    }

    let defaultWatchlist;
    if (!defaultWatchlistInfo) {
      // Create a default watchlist
      defaultWatchlist = await alpacaClient.createWatchlist(account.id, 'Default', []);
    } else {
      // Fetch full watchlist details (list endpoint doesn't include assets)
      defaultWatchlist = await alpacaClient.getWatchlist(account.id, defaultWatchlistInfo.id);
    }

    console.log('[Watchlist GET] Full watchlist:', JSON.stringify(defaultWatchlist, null, 2));
    res.json({
      id: defaultWatchlist.id,
      name: defaultWatchlist.name,
      symbols: defaultWatchlist.assets?.map(a => a.symbol) || [],
    });
  } catch (error) {
    console.error('Watchlist error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get watchlist',
      details: error.response?.data || error.message
    });
  }
});

// Add symbol to watchlist
app.post('/api/watchlist/:symbol', requireAuth(), async (req, res) => {
  console.log('[Watchlist POST] Adding symbol:', req.params.symbol);
  if (!alpacaClient) {
    return res.status(503).json({ error: 'Alpaca not available' });
  }

  const { userId } = getAuth(req);
  const { symbol } = req.params;

  try {
    const account = await getUserAlpacaAccount(userId);
    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    let watchlists = await alpacaClient.getWatchlists(account.id);
    console.log('[Watchlist POST] Found watchlists:', watchlists.length);
    let defaultWatchlist = watchlists.find(w => w.name === 'Default') || watchlists[0];

    if (!defaultWatchlist) {
      console.log('[Watchlist POST] Creating new watchlist with symbol:', symbol.toUpperCase());
      defaultWatchlist = await alpacaClient.createWatchlist(account.id, 'Default', [symbol.toUpperCase()]);
    } else {
      console.log('[Watchlist POST] Adding to existing watchlist:', defaultWatchlist.id);
      defaultWatchlist = await alpacaClient.addToWatchlist(account.id, defaultWatchlist.id, symbol.toUpperCase());
    }

    console.log('[Watchlist POST] Result:', defaultWatchlist);
    res.json({
      id: defaultWatchlist.id,
      name: defaultWatchlist.name,
      symbols: defaultWatchlist.assets?.map(a => a.symbol) || [],
    });
  } catch (error) {
    console.error('Add to watchlist error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to add to watchlist',
      details: error.response?.data || error.message
    });
  }
});

// Remove symbol from watchlist
app.delete('/api/watchlist/:symbol', requireAuth(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({ error: 'Alpaca not available' });
  }

  const { userId } = getAuth(req);
  const { symbol } = req.params;

  try {
    const account = await getUserAlpacaAccount(userId);
    if (!account) {
      return res.status(404).json({ error: 'No Alpaca account found' });
    }

    const watchlists = await alpacaClient.getWatchlists(account.id);
    const defaultWatchlist = watchlists.find(w => w.name === 'Default') || watchlists[0];

    if (!defaultWatchlist) {
      return res.status(404).json({ error: 'No watchlist found' });
    }

    const updatedWatchlist = await alpacaClient.removeFromWatchlist(account.id, defaultWatchlist.id, symbol.toUpperCase());

    res.json({
      id: updatedWatchlist.id,
      name: updatedWatchlist.name,
      symbols: updatedWatchlist.assets?.map(a => a.symbol) || [],
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to remove from watchlist',
      details: error.response?.data || error.message
    });
  }
});

// ============ Sumsub KYC Endpoints ============

// Generate Sumsub access token for Web SDK
app.post('/api/kyc/token', requireAuth(), async (req, res) => {
  if (!sumsubClient) {
    return res.status(503).json({
      error: 'KYC verification not available',
      details: 'Sumsub client not configured'
    });
  }

  const { userId } = getAuth(req);
  const levelName = process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level';

  try {
    const tokenData = await sumsubClient.generateAccessToken(userId, levelName);
    res.json({
      token: tokenData.token,
      userId: tokenData.userId,
    });
  } catch (error) {
    console.error('Sumsub token generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to generate KYC access token',
      details: error.response?.data?.description || error.message
    });
  }
});

// Get KYC verification status
app.get('/api/kyc/status', requireAuth(), async (req, res) => {
  if (!sumsubClient) {
    return res.status(503).json({
      error: 'KYC verification not available',
      details: 'Sumsub client not configured'
    });
  }

  const { userId } = getAuth(req);

  try {
    // Get user email from Clerk
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    // Check for existing Alpaca account
    let alpacaAccount = null;
    if (alpacaClient && email) {
      alpacaAccount = await alpacaClient.getAccountByEmail(email);
    }

    // If user has Alpaca account, they're verified
    if (alpacaAccount) {
      return res.json({
        reviewStatus: 'completed',
        reviewResult: { reviewAnswer: 'GREEN' },
        alpacaAccount: {
          id: alpacaAccount.id,
          status: alpacaAccount.status,
          accountNumber: alpacaAccount.account_number,
        },
        message: 'Alpaca account found'
      });
    }

    // Otherwise check Sumsub status
    const applicant = await sumsubClient.getApplicantByExternalId(userId);
    const status = await sumsubClient.getApplicantStatus(applicant.id);

    res.json({
      applicantId: applicant.id,
      reviewStatus: applicant.review?.reviewStatus || 'init',
      reviewResult: applicant.review?.reviewResult || null,
      requiredDocs: status,
      alpacaAccount: null,
    });
  } catch (error) {
    // If applicant doesn't exist yet, return pending status
    if (error.response?.status === 404) {
      return res.json({
        reviewStatus: 'init',
        reviewResult: null,
        alpacaAccount: null,
        message: 'Verification not started'
      });
    }

    console.error('Sumsub status check error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get KYC status',
      details: error.response?.data?.description || error.message
    });
  }
});

// ============ Stripe Endpoints ============

// Get all Stripe products (admin only)
app.get('/api/stripe/products', requireAuth(), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not available',
      details: 'Stripe client not configured'
    });
  }

  try {
    const products = await stripe.products.list({
      expand: ['data.default_price'],
      limit: 100,
    });

    // Format products with their prices
    const formattedProducts = products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      images: product.images,
      metadata: product.metadata,
      default_price: product.default_price ? {
        id: product.default_price.id,
        unit_amount: product.default_price.unit_amount,
        currency: product.default_price.currency,
        recurring: product.default_price.recurring,
      } : null,
    }));

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Stripe products error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch Stripe products',
      details: error.message
    });
  }
});

// Get all Stripe customers
app.get('/api/stripe/customers', requireAuth(), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not available',
      details: 'Stripe client not configured'
    });
  }

  try {
    const customers = await stripe.customers.list({ limit: 100 });
    res.json({ customers: customers.data });
  } catch (error) {
    console.error('Stripe customers error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch Stripe customers',
      details: error.message
    });
  }
});

// Create a Stripe customer
app.post('/api/stripe/customers', requireAuth(), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not available',
      details: 'Stripe client not configured'
    });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if customer already exists
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      return res.status(409).json({
        error: 'Customer already exists',
        customer: existing.data[0]
      });
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
    });

    res.json({ customer });
  } catch (error) {
    console.error('Create Stripe customer error:', error.message);
    res.status(500).json({
      error: 'Failed to create Stripe customer',
      details: error.message
    });
  }
});

// Update a Stripe customer
app.patch('/api/stripe/customers/:customerId', requireAuth(), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not available',
      details: 'Stripe client not configured'
    });
  }

  const { customerId } = req.params;
  const { name, email } = req.body;

  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const customer = await stripe.customers.update(customerId, updateData);
    res.json({ customer });
  } catch (error) {
    console.error('Update Stripe customer error:', error.message);
    res.status(500).json({
      error: 'Failed to update Stripe customer',
      details: error.message
    });
  }
});

// Update a Clerk user (admin only)
app.patch('/api/admin/users/:targetUserId', requireAuth(), requireAdmin(), async (req, res) => {
  const { targetUserId } = req.params;
  const { firstName, lastName } = req.body;

  try {
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    const user = await clerkClient.users.updateUser(targetUserId, updateData);

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses?.[0]?.emailAddress,
      }
    });
  } catch (error) {
    console.error('Update Clerk user error:', error.message);
    res.status(500).json({
      error: 'Failed to update user',
      details: error.message
    });
  }
});

// Delete a Stripe customer (admin only)
app.delete('/api/stripe/customers/:customerId', requireAuth(), requireAdmin(), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not available',
      details: 'Stripe client not configured'
    });
  }

  const { customerId } = req.params;

  try {
    const deleted = await stripe.customers.del(customerId);
    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Delete Stripe customer error:', error.message);
    res.status(500).json({
      error: 'Failed to delete Stripe customer',
      details: error.message
    });
  }
});

// Create an Alpaca broker account (admin only)
app.post('/api/alpaca/accounts', requireAuth(), requireAdmin(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { contact, identity, disclosures, agreements } = req.body;

  // Validate required fields
  if (!contact?.email_address) {
    return res.status(400).json({ error: 'Email address is required' });
  }
  if (!identity?.given_name || !identity?.family_name) {
    return res.status(400).json({ error: 'First and last name are required' });
  }
  if (!identity?.date_of_birth) {
    return res.status(400).json({ error: 'Date of birth is required' });
  }
  if (!identity?.country_of_tax_residence) {
    return res.status(400).json({ error: 'Country of tax residence is required' });
  }
  if (!identity?.tax_id) {
    return res.status(400).json({ error: 'Tax ID is required' });
  }
  if (!contact?.street_address || !contact?.city || !contact?.state || !contact?.postal_code) {
    return res.status(400).json({ error: 'Complete address is required' });
  }
  if (!disclosures) {
    return res.status(400).json({ error: 'Disclosures are required' });
  }
  if (!agreements || !agreements.length) {
    return res.status(400).json({ error: 'Agreements are required' });
  }

  try {
    const accountData = {
      contact,
      identity,
      disclosures,
      agreements,
      enabled_assets: ['us_equity'],
    };

    const account = await alpacaClient.createAccount(accountData);

    res.json({
      success: true,
      account: {
        id: account.id,
        accountNumber: account.account_number,
        status: account.status,
        email: account.contact?.email_address,
        firstName: account.identity?.given_name,
        lastName: account.identity?.family_name,
        createdAt: account.created_at,
      }
    });
  } catch (error) {
    console.error('Create Alpaca account error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create Alpaca account',
      details: error.response?.data || error.message
    });
  }
});

// Get a single Alpaca account by ID (admin only)
app.get('/api/alpaca/accounts/:accountId', requireAuth(), requireAdmin(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { accountId } = req.params;

  try {
    const account = await alpacaClient.getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ account });
  } catch (error) {
    console.error('Get Alpaca account error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get Alpaca account',
      details: error.response?.data || error.message
    });
  }
});

// Update an Alpaca account (admin only)
app.patch('/api/alpaca/accounts/:accountId', requireAuth(), requireAdmin(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  const { accountId } = req.params;
  const { firstName, lastName } = req.body;

  try {
    const updates = {
      identity: {}
    };
    if (firstName !== undefined) updates.identity.given_name = firstName;
    if (lastName !== undefined) updates.identity.family_name = lastName;

    const account = await alpacaClient.updateAccount(accountId, updates);

    res.json({
      success: true,
      account: {
        id: account.id,
        firstName: account.identity?.given_name,
        lastName: account.identity?.family_name,
      }
    });
  } catch (error) {
    console.error('Update Alpaca account error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to update Alpaca account',
      details: error.response?.data || error.message
    });
  }
});

// Get users with onboarding data (for Alpaca account creation testing)
app.get('/api/admin/users/with-onboarding', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const clerkUsers = await clerkClient.users.getUserList({ limit: 500 });
    const users = (clerkUsers.data || [])
      .filter(user => user.privateMetadata?.onboarding)
      .map(user => ({
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || null,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phoneNumbers?.[0]?.phoneNumber || null,
        onboarding: user.privateMetadata.onboarding,
        hasCompletedOnboarding: !!user.privateMetadata.onboarding.completedAt,
      }));

    res.json({ users });
  } catch (error) {
    console.error('Failed to get users with onboarding:', error.message);
    res.status(500).json({
      error: 'Failed to get users with onboarding data',
      details: error.message
    });
  }
});

// Get unified users overview (Clerk + Alpaca + Stripe by email)
app.get('/api/admin/users/overview', requireAuth(), async (req, res) => {
  try {
    // Fetch from all platforms in parallel
    const [clerkUsers, alpacaAccounts, stripeCustomers] = await Promise.all([
      // Clerk users
      clerkClient.users.getUserList({ limit: 500 }).then(r => r.data || []),
      // Alpaca accounts (if available)
      alpacaClient ? alpacaClient.getAllAccounts().catch(() => []) : Promise.resolve([]),
      // Stripe customers (if available)
      stripe ? stripe.customers.list({ limit: 100 }).then(r => r.data).catch(() => []) : Promise.resolve([])
    ]);

    // Build email-indexed maps
    const alpacaByEmail = {};
    for (const acc of alpacaAccounts) {
      const email = acc.contact?.email_address?.toLowerCase();
      if (email) {
        alpacaByEmail[email] = {
          id: acc.id,
          accountNumber: acc.account_number,
          status: acc.status,
          createdAt: acc.created_at,
          firstName: acc.identity?.given_name || null,
          lastName: acc.identity?.family_name || null,
        };
      }
    }

    const stripeByEmail = {};
    for (const cust of stripeCustomers) {
      const email = cust.email?.toLowerCase();
      if (email) {
        stripeByEmail[email] = {
          id: cust.id,
          name: cust.name,
          created: cust.created,
        };
      }
    }

    // Build unified user list
    const users = clerkUsers.map(user => {
      const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      return {
        email: email || null,
        clerk: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
          isAdmin: user.privateMetadata?.isAdmin === true,
          onWaitlist: !!user.privateMetadata?.waitlist?.joined,
          hasTradingAccess: user.privateMetadata?.hasTradingAccess === true,
          hasRetailApiAccess: user.privateMetadata?.hasRetailApiAccess === true,
        },
        alpaca: email ? alpacaByEmail[email] || null : null,
        stripe: email ? stripeByEmail[email] || null : null,
      };
    });

    // Add any Stripe customers not in Clerk
    for (const cust of stripeCustomers) {
      const email = cust.email?.toLowerCase();
      if (email && !users.find(u => u.email === email)) {
        users.push({
          email,
          clerk: null,
          alpaca: alpacaByEmail[email] || null,
          stripe: {
            id: cust.id,
            name: cust.name,
            created: cust.created,
          },
        });
      }
    }

    // Add any Alpaca accounts not in Clerk or Stripe
    for (const acc of alpacaAccounts) {
      const email = acc.contact?.email_address?.toLowerCase();
      if (email && !users.find(u => u.email === email)) {
        users.push({
          email,
          clerk: null,
          alpaca: {
            id: acc.id,
            accountNumber: acc.account_number,
            status: acc.status,
            createdAt: acc.created_at,
            firstName: acc.identity?.given_name || null,
            lastName: acc.identity?.family_name || null,
          },
          stripe: null,
        });
      }
    }

    // Sort by email
    users.sort((a, b) => (a.email || '').localeCompare(b.email || ''));

    res.json({
      users,
      counts: {
        total: users.length,
        clerk: clerkUsers.length,
        alpaca: alpacaAccounts.length,
        stripe: stripeCustomers.length,
      }
    });
  } catch (error) {
    console.error('Users overview error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch users overview',
      details: error.message
    });
  }
});

// ============ Open Positions Admin Endpoint ============

// Get all open positions across all users (admin only)
app.get('/api/admin/positions', requireAuth(), requireAdmin(), async (req, res) => {
  if (!alpacaClient) {
    return res.status(503).json({
      error: 'Alpaca not available',
      details: 'Alpaca client not configured'
    });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search?.toLowerCase() || '';

    // Get all Alpaca accounts
    const allAccounts = await alpacaClient.getAllAccounts();

    // Filter accounts by search term (email or name)
    let filteredAccounts = allAccounts;
    if (search) {
      filteredAccounts = allAccounts.filter(acc => {
        const email = acc.contact?.email_address?.toLowerCase() || '';
        const firstName = acc.identity?.given_name?.toLowerCase() || '';
        const lastName = acc.identity?.family_name?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return email.includes(search) || fullName.includes(search);
      });
    }

    // Fetch positions for all filtered accounts in parallel
    const accountPositions = await Promise.all(
      filteredAccounts.map(async (account) => {
        const positions = await alpacaClient.getPositions(account.id);
        return positions.map(pos => ({
          userEmail: account.contact?.email_address || '',
          userName: [account.identity?.given_name, account.identity?.family_name]
            .filter(Boolean).join(' ') || '',
          alpacaAccountId: account.id,
          alpacaAccountNumber: account.account_number || '',
          symbol: pos.symbol,
          qty: pos.qty,
          side: pos.side,
          marketValue: pos.market_value,
          costBasis: pos.cost_basis,
          unrealizedPL: pos.unrealized_pl,
          unrealizedPLPercent: pos.unrealized_plpc,
          currentPrice: pos.current_price,
          avgEntryPrice: pos.avg_entry_price,
          assetId: pos.asset_id,
          assetClass: pos.asset_class,
        }));
      })
    );

    // Flatten and apply pagination
    const allPositions = accountPositions.flat();
    const total = allPositions.length;
    const paginatedPositions = allPositions.slice(offset, offset + limit);

    res.json({
      positions: paginatedPositions,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Admin positions error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get positions overview',
      details: error.response?.data || error.message
    });
  }
});

// ============ SEC Backfill Admin Endpoints ============

// Track running backfill jobs
const runningBackfillJobs = new Map();

// Get backfill status and stats
app.get('/api/admin/sec/backfill/status', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    // Get filing stats
    const stats = await supabaseClient.getFilingStats();

    // Get active jobs
    const activeJobs = await supabaseClient.getActiveBackfillJobs();

    // Calculate available date range
    const today = new Date();
    const availableRange = {
      earliest: '1994-01-01',
      latest: today.toISOString().split('T')[0]
    };

    res.json({
      stats,
      activeJobs: activeJobs.map(job => ({
        id: job.id,
        type: job.job_type,
        targetDate: job.target_date,
        targetQuarter: job.target_quarter,
        startDate: job.start_date,
        endDate: job.end_date,
        formTypes: job.form_types,
        status: job.status,
        progress: job.progress,
        startedAt: job.started_at,
        createdAt: job.created_at
      })),
      availableRange
    });
  } catch (error) {
    console.error('Backfill status error:', error.message);
    res.status(500).json({ error: 'Failed to get backfill status', details: error.message });
  }
});

// Get backfill job history
app.get('/api/admin/sec/backfill/jobs', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status || null;

    const result = await supabaseClient.getBackfillJobs({ status, limit, offset });

    res.json({
      jobs: result.jobs.map(job => ({
        id: job.id,
        type: job.job_type,
        targetDate: job.target_date,
        targetQuarter: job.target_quarter,
        startDate: job.start_date,
        endDate: job.end_date,
        formTypes: job.form_types,
        status: job.status,
        progress: job.progress,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        errorMessage: job.error_message,
        createdAt: job.created_at
      })),
      total: result.total
    });
  } catch (error) {
    console.error('Backfill jobs error:', error.message);
    res.status(500).json({ error: 'Failed to get backfill jobs', details: error.message });
  }
});

// Start a new backfill job
app.post('/api/admin/sec/backfill', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured() || !secClient) {
    return res.status(503).json({ error: 'SEC/Supabase not configured' });
  }

  try {
    const { type, startDate, endDate, targetDate, quarter, formTypes } = req.body;

    // Validate job type
    if (!['daily', 'range', 'quarter'].includes(type)) {
      return res.status(400).json({ error: 'Invalid job type. Must be: daily, range, or quarter' });
    }

    // Create the job
    const jobData = {
      type,
      targetDate: type === 'daily' ? (targetDate || startDate) : null,
      targetQuarter: type === 'quarter' ? quarter : null,
      startDate: type === 'range' ? startDate : null,
      endDate: type === 'range' ? endDate : null,
      formTypes: formTypes && formTypes.length > 0 ? formTypes : null
    };

    const job = await supabaseClient.createBackfillJob(jobData);

    // Start the job in the background
    const executeJob = async () => {
      try {
        runningBackfillJobs.set(job.id, true);
        await secClient.executeBackfillJob(job);
      } catch (error) {
        console.error(`Backfill job ${job.id} failed:`, error.message);
      } finally {
        runningBackfillJobs.delete(job.id);
      }
    };

    // Don't await - run in background
    executeJob();

    res.json({
      jobId: job.id,
      status: 'queued',
      message: 'Backfill job started'
    });
  } catch (error) {
    console.error('Start backfill error:', error.message);
    res.status(500).json({ error: 'Failed to start backfill job', details: error.message });
  }
});

// Cancel a backfill job
app.delete('/api/admin/sec/backfill/jobs/:jobId', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { jobId } = req.params;

    const job = await supabaseClient.cancelBackfillJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found or already completed' });
    }

    // Remove from running jobs if present
    runningBackfillJobs.delete(jobId);

    res.json({ success: true, job });
  } catch (error) {
    console.error('Cancel backfill error:', error.message);
    res.status(500).json({ error: 'Failed to cancel backfill job', details: error.message });
  }
});

// Get a specific backfill job
app.get('/api/admin/sec/backfill/jobs/:jobId', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { jobId } = req.params;
    const job = await supabaseClient.getBackfillJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      id: job.id,
      type: job.job_type,
      targetDate: job.target_date,
      targetQuarter: job.target_quarter,
      startDate: job.start_date,
      endDate: job.end_date,
      formTypes: job.form_types,
      status: job.status,
      progress: job.progress,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      errorMessage: job.error_message,
      createdAt: job.created_at
    });
  } catch (error) {
    console.error('Get backfill job error:', error.message);
    res.status(500).json({ error: 'Failed to get backfill job', details: error.message });
  }
});

// ============ SEC Filings V2 (Optimized Schema) Endpoints ============

// Check if optimized tables exist
app.get('/api/admin/sec/filings/setup-status', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const status = await supabaseClient.checkOptimizedTablesExist();
    res.json(status);
  } catch (error) {
    console.error('Check optimized tables error:', error.message);
    res.status(500).json({ error: 'Failed to check tables', details: error.message });
  }
});

// Create optimized tables
app.post('/api/admin/sec/filings/setup', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { connectionString } = req.body;

  // Connection string is optional if one is already stored
  if (!connectionString && !supabaseClient.hasStoredConnectionString()) {
    return res.status(400).json({ error: 'Connection string is required' });
  }

  try {
    const result = await supabaseClient.createOptimizedTables(connectionString || null);
    res.json(result);
  } catch (error) {
    console.error('Create optimized tables error:', error.message);
    res.status(500).json({ error: 'Failed to create tables', details: error.message });
  }
});

// Drop legacy tables (old schema, not current)
app.post('/api/admin/sec/filings/drop-legacy', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const result = await supabaseClient.dropLegacyTables();
    res.json(result);
  } catch (error) {
    console.error('Drop legacy tables error:', error.message);
    res.status(500).json({ error: 'Failed to drop legacy tables', details: error.message });
  }
});

// Nuclear option: drop ALL tables in the database
app.post('/api/admin/db/drop-all', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { confirm } = req.body;
  if (confirm !== 'DELETE_ALL_DATA') {
    return res.status(400).json({ error: 'Confirmation required. Send { confirm: "DELETE_ALL_DATA" }' });
  }

  try {
    const result = await supabaseClient.dropAllTables();
    res.json(result);
  } catch (error) {
    console.error('Drop all tables error:', error.message);
    res.status(500).json({ error: 'Failed to drop all tables', details: error.message });
  }
});

// Get optimized schema stats
app.get('/api/admin/sec/filings/stats', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const stats = await supabaseClient.getOptimizedStats();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

// Get form type and extension maps for client-side processing
app.get('/api/admin/sec/filings/lookup-maps', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const [formTypes, extensions] = await Promise.all([
      supabaseClient.getFormTypeMap(),
      supabaseClient.getExtensionMap()
    ]);
    res.json({ formTypes, extensions });
  } catch (error) {
    console.error('Get lookup maps error:', error.message);
    res.status(500).json({ error: 'Failed to get lookup maps', details: error.message });
  }
});

// Bulk insert filings
app.post('/api/admin/sec/filings/bulk-insert', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { filings, companies, formTypes, extensions } = req.body;
  console.log(`[bulk-insert] ft=${formTypes?.length || 0} ext=${extensions?.length || 0} co=${companies?.length || 0} fil=${filings?.length || 0}`);

  try {
    let formTypeMap = {};
    let extensionMap = {};

    if (formTypes && formTypes.length > 0) {
      formTypeMap = await supabaseClient.ensureFormTypes(formTypes);
    }

    if (extensions && extensions.length > 0) {
      extensionMap = await supabaseClient.ensureExtensions(extensions);
    }

    if (companies && companies.length > 0) {
      await supabaseClient.bulkUpsertCompanies(companies);
      console.log(`[bulk-insert] companies done`);
    }

    let inserted = 0;
    if (filings && filings.length > 0) {
      const result = await supabaseClient.bulkInsertFilings(filings);
      inserted = result.inserted;
      console.log(`[bulk-insert] filings done, inserted=${inserted}`);
    }

    res.json({
      success: true,
      inserted,
      formTypeMap,
      extensionMap
    });
  } catch (error) {
    console.error('Bulk insert error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to bulk insert', details: error.message });
  }
});

// ============ SEC Filings Import via psql ============

// Track import jobs
const secImportJobs = new Map();

// Upload SQL dump and prepare for import
app.post('/api/admin/sec/filings/upload-dump', requireAuth(), requireAdmin(), async (req, res) => {
  const { sql } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'SQL dump required' });
  }

  // Check if connection string exists
  const connectionString = supabaseClient?.loadConnectionString();
  if (!connectionString) {
    return res.status(503).json({ error: 'No database connection configured' });
  }

  // Generate job ID
  const jobId = `import_${Date.now()}`;

  // Save SQL to temp file
  const tempDir = path.join(__dirname, 'data', 'sec-imports');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const sqlFile = path.join(tempDir, `${jobId}.sql`);
  fs.writeFileSync(sqlFile, sql, 'utf8');

  // Store job info
  secImportJobs.set(jobId, {
    id: jobId,
    status: 'ready',
    sqlFile,
    sqlSize: sql.length,
    createdAt: new Date().toISOString(),
    progress: null,
    error: null
  });

  res.json({
    success: true,
    jobId,
    sqlSize: sql.length,
    status: 'ready'
  });
});

// Get import job status
app.get('/api/admin/sec/filings/import-status/:jobId', requireAuth(), requireAdmin(), (req, res) => {
  const { jobId } = req.params;
  const job = secImportJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

// Run the import using pg-copy-streams
app.post('/api/admin/sec/filings/run-import/:jobId', requireAuth(), requireAdmin(), async (req, res) => {
  const { jobId } = req.params;
  const job = secImportJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status === 'running') {
    return res.status(400).json({ error: 'Import already running' });
  }

  if (job.status === 'completed') {
    return res.status(400).json({ error: 'Import already completed' });
  }

  const connectionString = supabaseClient?.loadConnectionString();
  if (!connectionString) {
    return res.status(503).json({ error: 'No database connection configured' });
  }

  // Update job status
  job.status = 'running';
  job.startedAt = new Date().toISOString();
  job.progress = { linesProcessed: 0, currentTable: null };

  // Start import in background
  console.log(`[SEC Import] Starting import for job ${jobId}`);
  console.log(`[SEC Import] SQL file: ${job.sqlFile}`);

  // Run the import asynchronously
  (async () => {
    const client = new Client({ connectionString });

    try {
      await client.connect();
      console.log('[SEC Import] Connected to database');

      // Read the SQL file
      const sqlContent = fs.readFileSync(job.sqlFile, 'utf8');
      console.log('[SEC Import] SQL content length:', sqlContent.length);

      // Split into individual statements (by semicolon followed by newline)
      // Then strip leading comment lines from each statement
      const statements = sqlContent
        .split(/;\s*\n/)
        .map(s => {
          // Remove leading comment lines
          const lines = s.split('\n');
          while (lines.length > 0 && lines[0].trim().startsWith('--')) {
            lines.shift();
          }
          return lines.join('\n').trim();
        })
        .filter(s => s.length > 0);

      console.log(`[SEC Import] Found ${statements.length} statements`);
      console.log(`[SEC Import] Statement types:`, statements.map(s => s.split(' ')[0]).join(', '));

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        const firstLine = stmt.split('\n')[0].substring(0, 50);

        // Track which table we're working on
        if (stmt.startsWith('TRUNCATE')) {
          const tableMatch = stmt.match(/TRUNCATE\s+(\w+)/);
          if (tableMatch) job.progress.currentTable = tableMatch[1];
        } else if (stmt.startsWith('INSERT INTO')) {
          const tableMatch = stmt.match(/INSERT INTO\s+(\w+)/);
          if (tableMatch) job.progress.currentTable = tableMatch[1];
          // Count rows in INSERT
          const rowCount = (stmt.match(/\),?\s*\(/g) || []).length + 1;
          job.progress.linesProcessed += rowCount;
        }

        console.log(`[SEC Import] Executing statement ${i + 1}/${statements.length}: ${firstLine}...`);
        await client.query(stmt);
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.progress.currentTable = null;
      console.log(`[SEC Import] Import completed successfully. Lines processed: ${job.progress.linesProcessed}`);

      // Clean up temp file
      try {
        fs.unlinkSync(job.sqlFile);
      } catch (e) {
        console.error('Failed to delete temp file:', e.message);
      }
    } catch (err) {
      job.status = 'failed';
      job.error = err.message || err.toString() || 'Unknown error';
      job.completedAt = new Date().toISOString();
      console.error(`[SEC Import] Import failed:`, err);
      console.error(`[SEC Import] Error stack:`, err.stack);
    } finally {
      try {
        await client.end();
      } catch (e) {
        console.error('[SEC Import] Error closing client:', e);
      }
    }
  })();

  res.json({ success: true, status: 'running' });
});

// Cancel/cleanup an import job
app.delete('/api/admin/sec/filings/import/:jobId', requireAuth(), requireAdmin(), (req, res) => {
  const { jobId } = req.params;
  const job = secImportJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Clean up temp file
  try {
    if (fs.existsSync(job.sqlFile)) {
      fs.unlinkSync(job.sqlFile);
    }
  } catch (e) {
    console.error('Failed to delete temp file:', e.message);
  }

  secImportJobs.delete(jobId);
  res.json({ success: true });
});

// ============ SEC Daily Indices Admin Endpoints (Legacy) ============

// Track running daily index sync jobs
const runningDailyIndexSyncJobs = new Map();

// Check if daily indices tables exist
app.get('/api/admin/sec/daily-indices/setup-status', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const status = await supabaseClient.checkDailyIndicesTablesExist();
    res.json(status);
  } catch (error) {
    console.error('Check tables error:', error.message);
    res.status(500).json({ error: 'Failed to check tables', details: error.message });
  }
});

// ============ Settings Endpoints ============

// Get database connection status
app.get('/api/admin/settings/database/status', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient) {
    return res.json({ configured: false, connected: false, error: 'Supabase client not initialized' });
  }

  const configured = supabaseClient.isPostgresConfigured();
  if (!configured) {
    return res.json({ configured: false, connected: false });
  }

  // Test the connection
  try {
    const result = await supabaseClient.checkDailyIndicesTablesExist();
    res.json({
      configured: true,
      connected: !result.error,
      error: result.error || null
    });
  } catch (error) {
    res.json({
      configured: true,
      connected: false,
      error: error.message
    });
  }
});

// Test database connection
app.post('/api/admin/settings/database/test', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient) {
    return res.status(503).json({ success: false, error: 'Supabase client not initialized' });
  }

  const { connectionString } = req.body;
  if (!connectionString) {
    return res.status(400).json({ success: false, error: 'Connection string is required' });
  }

  try {
    const sql = supabaseClient.createPostgresConnection(connectionString);
    await sql`SELECT 1`;
    await sql.end();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Save database connection string
app.post('/api/admin/settings/database/connection', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient) {
    return res.status(503).json({ success: false, error: 'Supabase client not initialized' });
  }

  const { connectionString } = req.body;
  if (!connectionString) {
    return res.status(400).json({ success: false, error: 'Connection string is required' });
  }

  // Test the connection first
  try {
    const sql = supabaseClient.createPostgresConnection(connectionString);
    await sql`SELECT 1`;
    await sql.end();
  } catch (error) {
    return res.json({ success: false, error: `Connection test failed: ${error.message}` });
  }

  // Save the connection string
  const saved = supabaseClient.saveConnectionString(connectionString);
  if (saved) {
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Failed to save connection string' });
  }
});

// ============ Financial API Keys Management (Encrypted Supabase Storage) ============

// List of supported API keys
const SUPPORTED_API_KEYS = [
  'ALPHA_VANTAGE_API_KEY',
  'FINNHUB_API_KEY',
  'TWELVE_DATA_API_KEY',
  'POLYGON_API_KEY',
  'FMP_API_KEY',
  'TIINGO_API_KEY',
  'FRED_API_KEY',
  'EXCHANGERATE_API_KEY',
  'NEWS_API_KEY',
  'MARKETSTACK_API_KEY',
  'NASDAQ_DATA_LINK_API_KEY'
];

// Ensure api_keys table exists in Supabase
async function ensureApiKeysTable() {
  if (!supabaseClient || !supabaseClient.hasStoredConnectionString()) {
    console.log('API Keys: Supabase not configured, skipping table check');
    return false;
  }

  const sql = supabaseClient.getPooledConnection();
  try {
    // Check if table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'api_keys'
      ) as exists
    `;

    if (!result[0]?.exists) {
      console.log('API Keys: Creating api_keys table...');
      await sql`
        CREATE TABLE api_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key_name VARCHAR(100) UNIQUE NOT NULL,
          encrypted_value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log('API Keys: Table created successfully');
    }
    return true;
  } catch (error) {
    console.error('API Keys: Error ensuring table exists:', error.message);
    return false;
  }
}

// Load API keys from Supabase into process.env
async function loadApiKeysFromSupabase() {
  if (!supabaseClient || !supabaseClient.hasStoredConnectionString()) {
    console.log('API Keys: Supabase not configured, skipping key load');
    return;
  }

  if (!isEncryptionConfigured()) {
    console.log('API Keys: ENCRYPTION_KEY not configured, skipping key load');
    return;
  }

  const sql = supabaseClient.getPooledConnection();
  try {
    const rows = await sql`
      SELECT key_name, encrypted_value FROM api_keys
    `;

    let loaded = 0;
    for (const row of rows) {
      if (SUPPORTED_API_KEYS.includes(row.key_name)) {
        try {
          const decryptedValue = decrypt(row.encrypted_value);
          process.env[row.key_name] = decryptedValue;
          loaded++;
        } catch (err) {
          console.error(`API Keys: Failed to decrypt ${row.key_name}:`, err.message);
        }
      }
    }
    if (loaded > 0) {
      console.log(`API Keys: Loaded ${loaded} keys from Supabase`);
    }
  } catch (error) {
    // Table might not exist yet
    if (!error.message?.includes('does not exist')) {
      console.error('API Keys: Error loading keys:', error.message);
    }
  }
}

// Get API key configuration status
app.get('/api/admin/settings/api-keys/status', requireAuth(), requireAdmin(), async (req, res) => {
  const keys = {};
  const encryptionConfigured = isEncryptionConfigured();
  const supabaseConfigured = supabaseClient?.hasStoredConnectionString() || false;

  for (const key of SUPPORTED_API_KEYS) {
    keys[key] = !!process.env[key];
  }

  // Check if api_keys table exists using the same connection as ensureApiKeysTable()
  let tableExists = false;
  if (supabaseConfigured) {
    try {
      const sql = supabaseClient.getPooledConnection();
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'api_keys'
        ) as exists
      `;
      tableExists = result[0]?.exists || false;
    } catch (e) {
      tableExists = false;
    }
  }

  res.json({
    keys,
    encryptionConfigured,
    supabaseConfigured,
    tableExists
  });
});

// Ensure table exists endpoint (called from admin UI)
app.post('/api/admin/settings/api-keys/init', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const success = await ensureApiKeysTable();
    if (success) {
      res.json({ success: true, message: 'API keys table ready' });
    } else {
      res.json({ success: false, error: 'Could not initialize table - check Supabase connection' });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Save API keys (encrypted to Supabase)
app.post('/api/admin/settings/api-keys', requireAuth(), requireAdmin(), async (req, res) => {
  const { keys } = req.body;

  if (!keys || typeof keys !== 'object') {
    return res.status(400).json({ success: false, error: 'Keys object is required' });
  }

  if (!supabaseClient || !supabaseClient.hasStoredConnectionString()) {
    return res.status(503).json({ success: false, error: 'Database not configured' });
  }

  if (!isEncryptionConfigured()) {
    return res.status(503).json({ success: false, error: 'ENCRYPTION_KEY not configured on server' });
  }

  const sql = supabaseClient.getPooledConnection();

  try {
    // Ensure table exists
    await ensureApiKeysTable();

    let updated = 0;
    for (const [keyName, value] of Object.entries(keys)) {
      if (SUPPORTED_API_KEYS.includes(keyName) && value && value.trim()) {
        const trimmedValue = value.trim();
        const encryptedValue = encrypt(trimmedValue);

        // Upsert the key
        await sql`
          INSERT INTO api_keys (key_name, encrypted_value, updated_at)
          VALUES (${keyName}, ${encryptedValue}, NOW())
          ON CONFLICT (key_name)
          DO UPDATE SET encrypted_value = ${encryptedValue}, updated_at = NOW()
        `;

        // Update process.env immediately
        process.env[keyName] = trimmedValue;
        updated++;
      }
    }

    res.json({ success: true, updated });
  } catch (error) {
    console.error('Error saving API keys:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Delete an API key
app.delete('/api/admin/settings/api-keys/:keyName', requireAuth(), requireAdmin(), async (req, res) => {
  const { keyName } = req.params;

  if (!SUPPORTED_API_KEYS.includes(keyName)) {
    return res.status(400).json({ success: false, error: 'Invalid key name' });
  }

  if (!supabaseClient || !supabaseClient.hasStoredConnectionString()) {
    return res.status(503).json({ success: false, error: 'Database not configured' });
  }

  const sql = supabaseClient.getPooledConnection();

  try {
    await sql`DELETE FROM api_keys WHERE key_name = ${keyName}`;
    delete process.env[keyName];
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Get cache rules
app.get('/api/admin/cache-rules', requireAuth(), requireAdmin(), (req, res) => {
  try {
    const rules = cacheRulesManager.getRules();
    res.json(rules);
  } catch (error) {
    console.error('Error getting cache rules:', error.message);
    res.status(500).json({ error: 'Failed to get cache rules' });
  }
});

// Update cache rules
app.put('/api/admin/cache-rules', requireAuth(), requireAdmin(), (req, res) => {
  try {
    const newRules = req.body;
    if (!newRules || typeof newRules !== 'object') {
      return res.status(400).json({ error: 'Invalid rules format' });
    }
    const success = cacheRulesManager.updateRules(newRules);
    if (success) {
      res.json({ success: true, rules: cacheRulesManager.getRules() });
    } else {
      res.status(500).json({ error: 'Failed to save cache rules' });
    }
  } catch (error) {
    console.error('Error updating cache rules:', error.message);
    res.status(500).json({ error: 'Failed to update cache rules' });
  }
});

// Get cache statistics
app.get('/api/admin/cache-stats', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const stats = await redisCache.getCacheStats();
    if (stats) {
      res.json(stats);
    } else {
      res.status(503).json({ error: 'Redis not connected' });
    }
  } catch (error) {
    console.error('Error getting cache stats:', error.message);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear cache by client prefix (handler)
const clearCacheHandler = async (req, res) => {
  try {
    const { client, type } = req.params;
    const validClients = ['finnhub', 'polygon', 'yahoo', 'sec'];

    if (!validClients.includes(client)) {
      return res.status(400).json({ error: 'Invalid client. Must be one of: ' + validClients.join(', ') });
    }

    // Build prefix: either "client" or "client:type"
    const prefix = type ? `${client}:${type}` : client;
    const result = await redisCache.clearByPrefix(prefix);
    if (result.success) {
      res.json({ success: true, deleted: result.deleted, client, type: type || null });
    } else {
      res.status(503).json({ error: 'Redis not connected' });
    }
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};
app.delete('/api/admin/cache-clear/:client/:type', requireAuth(), requireAdmin(), clearCacheHandler);
app.delete('/api/admin/cache-clear/:client', requireAuth(), requireAdmin(), clearCacheHandler);

// Create daily indices tables
app.post('/api/admin/sec/daily-indices/setup', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { connectionString } = req.body;
  if (!connectionString) {
    return res.status(400).json({ error: 'Connection string is required', details: 'Please provide your PostgreSQL connection string' });
  }

  try {
    const result = await supabaseClient.createDailyIndicesTables(connectionString);
    res.json(result);
  } catch (error) {
    console.error('Create tables error:', error.message);
    res.status(500).json({ error: 'Failed to create tables', details: error.message });
  }
});

// Get daily indices status and stats
app.get('/api/admin/sec/daily-indices/status', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    // Get stats
    const stats = await supabaseClient.getDailyIndexStats();

    // Get counts by year
    const yearCounts = await supabaseClient.getDailyIndexCountsByYear();

    // Get active jobs
    const activeJobs = await supabaseClient.getActiveDailyIndexSyncJobs();

    // Calculate available date range
    const availableRange = {
      earliest: '1994-01-03',
      latest: new Date().toISOString().split('T')[0]
    };

    res.json({
      stats,
      yearCounts,
      activeJobs: activeJobs.map(job => ({
        id: job.id,
        type: job.job_type,
        targetDate: job.target_date,
        startDate: job.start_date,
        endDate: job.end_date,
        status: job.status,
        progress: job.progress,
        startedAt: job.started_at,
        createdAt: job.created_at
      })),
      availableRange
    });
  } catch (error) {
    console.error('Daily indices status error:', error.message);
    res.status(500).json({ error: 'Failed to get daily indices status', details: error.message });
  }
});

// Helper to generate SEC available dates (weekdays from 1994-01-03 to today)
function generateSECAvailableDates(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = d.toISOString().split('T')[0];
      const year = d.getFullYear();
      const month = d.getMonth();
      const quarter = Math.floor(month / 3) + 1;
      dates.push({
        indexDate: dateStr,
        year,
        quarter,
        url: `https://www.sec.gov/Archives/edgar/daily-index/${year}/QTR${quarter}/master.${dateStr.replace(/-/g, '')}.idx`,
        status: 'pending',
        filingCount: null,
        fileSize: null,
        downloadedAt: null,
        errorMessage: null
      });
    }
  }
  return dates;
}

// Get daily indices list with pagination (generates from SEC available dates)
app.get('/api/admin/sec/daily-indices', requireAuth(), requireAdmin(), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const filterStatus = req.query.status || null;
    const filterYear = req.query.year ? parseInt(req.query.year) : null;

    // SEC daily indices are available from 1994-01-03
    const SEC_START_DATE = '1994-01-03';
    const today = new Date().toISOString().split('T')[0];

    // Generate all available SEC dates (descending order - newest first)
    let allDates = generateSECAvailableDates(SEC_START_DATE, today).reverse();

    // If we have database configured, merge with actual sync status
    let dbIndicesMap = new Map();
    if (supabaseClient && supabaseClient.isPostgresConfigured()) {
      try {
        // Get all synced indices from DB to merge status
        const dbResult = await supabaseClient.getDailyIndices({ limit: 50000, offset: 0 });
        for (const idx of dbResult.indices) {
          dbIndicesMap.set(idx.index_date, {
            id: idx.id,
            status: idx.status,
            filingCount: idx.filing_count,
            fileSize: idx.file_size,
            downloadedAt: idx.downloaded_at,
            errorMessage: idx.error_message
          });
        }
      } catch (err) {
        console.error('Failed to fetch DB indices:', err.message);
      }
    }

    // Merge DB status into generated dates
    allDates = allDates.map(date => {
      const dbData = dbIndicesMap.get(date.indexDate);
      if (dbData) {
        return {
          ...date,
          id: dbData.id,
          status: dbData.status,
          filingCount: dbData.filingCount,
          fileSize: dbData.fileSize,
          downloadedAt: dbData.downloadedAt,
          errorMessage: dbData.errorMessage
        };
      }
      return date;
    });

    // Apply filters
    if (filterStatus) {
      allDates = allDates.filter(d => d.status === filterStatus);
    }
    if (filterYear) {
      allDates = allDates.filter(d => d.year === filterYear);
    }

    const total = allDates.length;
    const paginatedDates = allDates.slice(offset, offset + limit);

    res.json({
      indices: paginatedDates,
      total
    });
  } catch (error) {
    console.error('Get daily indices error:', error.message);
    res.status(500).json({ error: 'Failed to get daily indices', details: error.message });
  }
});

// Start a new daily index sync job
app.post('/api/admin/sec/daily-indices/sync', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured() || !secClient) {
    return res.status(503).json({ error: 'SEC/Supabase not configured' });
  }

  try {
    const { type, startDate, endDate, targetDate } = req.body;

    // Validate job type
    if (!['sync_available', 'download_range', 'download_single'].includes(type)) {
      return res.status(400).json({ error: 'Invalid job type. Must be: sync_available, download_range, or download_single' });
    }

    // Create the job
    const jobData = {
      type,
      startDate: type === 'download_range' ? startDate : null,
      endDate: type === 'download_range' ? endDate : null,
      targetDate: type === 'download_single' ? targetDate : null
    };

    const job = await supabaseClient.createDailyIndexSyncJob(jobData);

    // Start the job in the background
    const executeJob = async () => {
      try {
        runningDailyIndexSyncJobs.set(job.id, true);
        await secClient.executeDailyIndexSyncJob(job);
      } catch (error) {
        console.error(`Daily index sync job ${job.id} failed:`, error.message);
      } finally {
        runningDailyIndexSyncJobs.delete(job.id);
      }
    };

    // Don't await - run in background
    executeJob();

    res.json({
      jobId: job.id,
      status: 'queued',
      message: 'Daily index sync job started'
    });
  } catch (error) {
    console.error('Start daily index sync error:', error.message);
    res.status(500).json({ error: 'Failed to start daily index sync job', details: error.message });
  }
});

// Get daily index sync job history
app.get('/api/admin/sec/daily-indices/jobs', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status || null;

    const result = await supabaseClient.getDailyIndexSyncJobs({ status, limit, offset });

    res.json({
      jobs: result.jobs.map(job => ({
        id: job.id,
        type: job.job_type,
        targetDate: job.target_date,
        startDate: job.start_date,
        endDate: job.end_date,
        status: job.status,
        progress: job.progress,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        errorMessage: job.error_message,
        createdAt: job.created_at
      })),
      total: result.total
    });
  } catch (error) {
    console.error('Get daily index sync jobs error:', error.message);
    res.status(500).json({ error: 'Failed to get daily index sync jobs', details: error.message });
  }
});

// Cancel a daily index sync job
app.delete('/api/admin/sec/daily-indices/jobs/:jobId', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { jobId } = req.params;

    const job = await supabaseClient.cancelDailyIndexSyncJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found or already completed' });
    }

    // Remove from running jobs if present
    runningDailyIndexSyncJobs.delete(jobId);

    res.json({ success: true, job });
  } catch (error) {
    console.error('Cancel daily index sync error:', error.message);
    res.status(500).json({ error: 'Failed to cancel daily index sync job', details: error.message });
  }
});

// Download/refresh a single daily index and load filings
app.post('/api/admin/sec/daily-indices/:indexDate/download', requireAuth(), requireAdmin(), async (req, res) => {
  if (!supabaseClient || !supabaseClient.isConfigured() || !secClient) {
    return res.status(503).json({ error: 'SEC/Supabase not configured' });
  }

  try {
    const { indexDate } = req.params;

    // Download the index and insert filings
    const result = await secClient.downloadDailyIndex(indexDate, true);

    if (result.success) {
      // Update the index in the database
      const date = new Date(indexDate);
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3);

      await supabaseClient.upsertDailyIndex({
        indexDate,
        year,
        quarter,
        url: result.url,
        status: 'downloaded',
        filingCount: result.filingCount,
        fileSize: result.fileSize,
        downloadedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        indexDate,
        filingCount: result.filingCount,
        filingsInserted: result.filingsInserted,
        fileSize: result.fileSize
      });
    } else if (result.notAvailable) {
      const date = new Date(indexDate);
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3);

      await supabaseClient.upsertDailyIndex({
        indexDate,
        year,
        quarter,
        url: result.url,
        status: 'not_available',
        errorMessage: result.error
      });

      res.json({
        success: false,
        indexDate,
        notAvailable: true,
        message: 'Index file not available for this date'
      });
    } else {
      res.status(500).json({
        success: false,
        indexDate,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Download daily index error:', error.message);
    res.status(500).json({ error: 'Failed to download daily index', details: error.message });
  }
});

// Get available years
app.get('/api/admin/sec/daily-indices/years', requireAuth(), requireAdmin(), async (req, res) => {
  if (!secClient) {
    return res.status(503).json({ error: 'SEC client not configured' });
  }

  try {
    const years = secClient.getAvailableYears();
    res.json({ years });
  } catch (error) {
    console.error('Get available years error:', error.message);
    res.status(500).json({ error: 'Failed to get available years', details: error.message });
  }
});

// Start the server
async function initializeServices() {
  try {
    // Initialize Redis cache (with timeout to prevent hanging)
    if (process.env.REDIS_URL) {
      const connectPromise = redisCache.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      );
      try {
        await Promise.race([connectPromise, timeoutPromise]);
      } catch (error) {
        console.warn('Redis connection failed or timed out:', error.message);
        console.log('Server will continue without Redis caching');
      }
    } else {
      console.log('REDIS_URL not set - caching disabled');
    }

    // Load API keys from Supabase (encrypted storage)
    await loadApiKeysFromSupabase();

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

    // Initialize Polygon client
    if (process.env.POLYGON_API_KEY) {
      polygonClient = new PolygonClient(process.env.POLYGON_API_KEY, redisCache);
      console.log('Polygon.io Reference Data API enabled (with Redis cache)');
    } else {
      console.log('Polygon API key not found - reference data endpoints disabled');
    }

    // Initialize SEC client (uses Supabase for storage)
    if (supabaseClient && supabaseClient.isConfigured()) {
      secClient = new SECClient(supabaseClient);
      console.log('SEC EDGAR API enabled (with Supabase storage)');
    } else {
      console.log('SEC client disabled - Supabase not configured');
    }

    // Start SEC polling for live updates (uses RSS feed for ALL filings)
    let secPollingInterval = null;
    const startSECPolling = async () => {
      const poll = async () => {
        try {
          // Poll for new filings - this fetches from RSS and caches permanently
          // Returns only NEW filings that weren't already cached
          const newFilings = await secClient.pollForNewFilings(100);

          // Broadcast only new filings to connected clients (respecting their filters)
          for (const filing of newFilings) {
            for (const client of secConnections) {
              try {
                // Check if client has a form type filter
                const filter = client.formTypeFilter;
                if (filter) {
                  // Only send if filing matches the filter
                  if (filing.formType && filing.formType.toUpperCase().includes(filter.toUpperCase())) {
                    client.write(`data: ${JSON.stringify({ type: 'filing', filing })}\n\n`);
                  }
                } else {
                  // No filter, send all filings
                  client.write(`data: ${JSON.stringify({ type: 'filing', filing })}\n\n`);
                }
              } catch (err) {
                secConnections.delete(client);
              }
            }
          }

          if (newFilings.length > 0) {
            console.log(`SEC: ${newFilings.length} new filings cached and broadcast`);
          }
        } catch (error) {
          console.error('SEC polling error:', error.message);
        }
      };

      // Initial poll to populate cache
      await poll();

      // Poll every 60 seconds (SEC API rate limiting)
      secPollingInterval = setInterval(poll, 60000);
    };

    if (secClient) {
      startSECPolling().catch(console.error);
    }

    console.log('All services initialized');
  } catch (error) {
    console.error('Error initializing services:', error.message);
  }
}

function startServer() {
  // Start HTTP server immediately to bind to port
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Clerk authentication enabled');

    // Initialize services in the background after server starts
    initializeServices().catch(console.error);
  });
}

startServer();
