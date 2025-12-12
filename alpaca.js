const axios = require('axios');
const jwt = require('jsonwebtoken');

class AlpacaClient {
  constructor(config) {
    // Broker API OAuth credentials
    this.clientId = config.clientId;
    this.privateKey = config.privateKey;
    this.baseURL = config.baseURL || 'https://broker-api.sandbox.alpaca.markets';

    // Trading/Data API credentials (for market data)
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.dataURL = 'https://data.alpaca.markets'; // Market data API endpoint

    this.cache = new Map(); // Cache ticker lookups
    this.accessToken = null;
    this.tokenExpiry = null;

    // CIK to Ticker mapping for common companies
    this.cikToTicker = {
      '320193': 'AAPL',    // Apple Inc
      '789019': 'MSFT',    // Microsoft
      '1018724': 'AMZN',   // Amazon
      '1652044': 'GOOGL',  // Alphabet/Google
      '1326801': 'META',   // Meta/Facebook
      '1318605': 'TSLA',   // Tesla
      '1045810': 'NVDA',   // NVIDIA
      '1067983': 'BRK.B',  // Berkshire Hathaway
      '1090872': 'AMD',    // AMD
      '789019': 'MSFT',    // Microsoft
      '320193': 'AAPL'     // Apple
    };
  }

  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Create JWT for OAuth
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: this.clientId,
        aud: 'https://broker-api.alpaca.markets',
        sub: this.clientId,
        iat: now,
        exp: now + 300, // 5 minutes
        jti: `${this.clientId}-${now}`
      };

      const token = jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });

      // Exchange JWT for access token
      const params = new URLSearchParams();
      params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
      params.append('assertion', token);

      const response = await axios.post(
        `${this.baseURL}/v1/oauth/token`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 50 minutes (tokens typically last 1 hour)
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url, params = {}) {
    const token = await this.getAccessToken();
    return axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params
    });
  }

  async getAssetBySymbol(symbol) {
    const cacheKey = `symbol_${symbol}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseURL}/v1/assets/${symbol}`
      );

      const asset = response.data;
      this.cache.set(cacheKey, asset);
      return asset;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error looking up symbol ${symbol}:`, error.message);
      return null;
    }
  }

  async searchAssets(query) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseURL}/v1/assets`,
        {
          status: 'active',
          asset_class: 'us_equity'
        }
      );

      // Filter assets by name matching
      const assets = response.data.filter(asset =>
        asset.name && asset.name.toLowerCase().includes(query.toLowerCase())
      );

      return assets;
    } catch (error) {
      console.error(`Error searching assets for "${query}":`, error.message);
      return [];
    }
  }

  async enrichFinancialData(financialRecord) {
    const companyName = financialRecord.name;
    const cik = String(financialRecord.cik);

    try {
      let asset = null;

      // Strategy 1: Try CIK-to-Ticker mapping first
      if (this.cikToTicker[cik]) {
        const ticker = this.cikToTicker[cik];
        console.log(`Using CIK mapping: ${cik} -> ${ticker}`);
        asset = await this.getAssetBySymbol(ticker);
      }

      // Strategy 2: If no CIK mapping, search by company name
      if (!asset) {
        const assets = await this.searchAssets(companyName);

        if (assets.length > 0) {
          // Find best match (exact or closest match)
          asset = assets.find(a =>
            a.name.toLowerCase() === companyName.toLowerCase()
          ) || assets[0];
        }
      }

      // If we found an asset, return enriched data
      if (asset) {
        return {
          ...financialRecord,
          alpaca: {
            symbol: asset.symbol,
            exchange: asset.exchange,
            asset_id: asset.id,
            tradable: asset.tradable,
            marginable: asset.marginable,
            shortable: asset.shortable,
            easy_to_borrow: asset.easy_to_borrow,
            fractionable: asset.fractionable
          }
        };
      }
    } catch (error) {
      console.error(`Error enriching data for ${companyName} (CIK: ${cik}):`, error.message);
    }

    // Return original data if no match found
    return {
      ...financialRecord,
      alpaca: null
    };
  }

  /**
   * Get headers for market data API requests (uses API key auth, not OAuth)
   */
  getMarketDataHeaders() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Market data API credentials not configured. Set ALPACA_API_KEY and ALPACA_API_SECRET.');
    }
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret
    };
  }

  /**
   * Get historical price bars for a stock
   * @param {string} symbol - Stock ticker symbol (e.g., 'AAPL')
   * @param {Object} options - Query options
   * @param {string} options.timeframe - Bar timeframe: 1Min, 5Min, 15Min, 30Min, 1Hour, 4Hour, 1Day, 1Week, 1Month
   * @param {string} options.start - Start date (RFC-3339 or YYYY-MM-DD)
   * @param {string} options.end - End date (RFC-3339 or YYYY-MM-DD)
   * @param {number} options.limit - Max number of bars to return (default 1000, max 10000)
   * @param {string} options.adjustment - Price adjustment: raw, split, dividend, all (default: raw)
   * @param {string} options.feed - Data feed: iex, sip (default: iex for free tier)
   */
  async getPriceHistory(symbol, options = {}) {
    const {
      timeframe = '1Day',
      start,
      end,
      limit = 1000,
      adjustment = 'raw',
      feed = 'iex'
    } = options;

    try {
      const params = {
        timeframe,
        limit,
        adjustment,
        feed
      };

      if (start) params.start = start;
      if (end) params.end = end;

      const response = await axios.get(
        `${this.dataURL}/v2/stocks/${symbol}/bars`,
        {
          headers: this.getMarketDataHeaders(),
          params
        }
      );

      return {
        symbol,
        timeframe,
        bars: response.data.bars || [],
        next_page_token: response.data.next_page_token
      };
    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get the latest quote for a stock
   * @param {string} symbol - Stock ticker symbol
   */
  async getLatestQuote(symbol) {
    try {
      const response = await axios.get(
        `${this.dataURL}/v2/stocks/${symbol}/quotes/latest`,
        {
          headers: this.getMarketDataHeaders(),
          params: { feed: 'iex' }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching latest quote for ${symbol}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get the latest trade for a stock
   * @param {string} symbol - Stock ticker symbol
   */
  async getLatestTrade(symbol) {
    try {
      const response = await axios.get(
        `${this.dataURL}/v2/stocks/${symbol}/trades/latest`,
        {
          headers: this.getMarketDataHeaders(),
          params: { feed: 'iex' }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching latest trade for ${symbol}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = AlpacaClient;
