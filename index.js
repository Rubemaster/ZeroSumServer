require('dotenv').config({ override: true });
const express = require('express');
const { clerkMiddleware, requireAuth, getAuth, clerkClient } = require('@clerk/express');
const { AlpacaClient, FinnhubClient, YahooFinanceClient, SumsubClient } = require('./src/clients');
const RedisCache = require('./src/cache/redis');
const { TimeSeriesCalculator, CALCULATIONS } = require('./src/services/timeSeries');

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

// Initialize Sumsub client for KYC verification
let sumsubClient = null;
if (process.env.SUMSUB_APP_TOKEN && process.env.SUMSUB_SECRET_KEY) {
  sumsubClient = new SumsubClient(
    process.env.SUMSUB_APP_TOKEN,
    process.env.SUMSUB_SECRET_KEY
  );
  console.log('Sumsub KYC verification enabled');
}

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
