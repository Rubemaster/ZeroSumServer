const axios = require('axios');

class AlpacaClient {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.authURL = config.authURL || 'https://authx.sandbox.alpaca.markets';
    this.brokerURL = config.brokerURL || 'https://broker-api.sandbox.alpaca.markets';

    this.cache = new Map();
    this.accessToken = null;
    this.tokenExpiry = null;

    // CIK to Ticker mapping for common companies
    this.cikToTicker = {
      '320193': 'AAPL',
      '789019': 'MSFT',
      '1018724': 'AMZN',
      '1652044': 'GOOGL',
      '1326801': 'META',
      '1318605': 'TSLA',
      '1045810': 'NVDA',
      '1067983': 'BRK.B',
      '1090872': 'AMD'
    };
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Broker API credentials not configured. Set ALPACA_CLIENT_ID and ALPACA_CLIENT_SECRET.');
    }

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);

      const response = await axios.post(
        `${this.authURL}/v1/oauth2/token`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 900;
      this.tokenExpiry = Date.now() + ((expiresIn - 60) * 1000);

      console.log('Alpaca access token obtained successfully');
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

  async makeAuthenticatedPost(url, data = {}) {
    const token = await this.getAccessToken();
    return axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async makeAuthenticatedPut(url, data = {}) {
    const token = await this.getAccessToken();
    return axios.put(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async makeAuthenticatedDelete(url) {
    const token = await this.getAccessToken();
    return axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async makeAuthenticatedPatch(url, data = {}) {
    const token = await this.getAccessToken();
    return axios.patch(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAssetBySymbol(symbol) {
    const cacheKey = `symbol_${symbol}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/assets/${symbol}`
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
        `${this.brokerURL}/v1/assets`,
        {
          status: 'active',
          asset_class: 'us_equity'
        }
      );

      const assets = response.data.filter(asset =>
        asset.name && asset.name.toLowerCase().includes(query.toLowerCase())
      );

      return assets;
    } catch (error) {
      console.error(`Error searching assets for "${query}":`, error.message);
      return [];
    }
  }

  async getAccountByEmail(email) {
    try {
      console.log(`[AlpacaClient] Searching accounts with query: ${email}`);
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/accounts`,
        { query: email }
      );

      const accounts = response.data;
      console.log(`[AlpacaClient] Query returned ${accounts?.length || 0} accounts`);

      if (accounts && accounts.length > 0) {
        // The query parameter searches by email, so if we get results, they match
        // The list endpoint returns abbreviated data (contact.email_address may be undefined)
        // Trust the first result from the email query
        const account = accounts[0];
        console.log(`[AlpacaClient] Found account: id=${account.id}, status=${account.status}`);
        return account;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error looking up account by email ${email}:`, error.message);
      return null;
    }
  }

  async getTradingAccount(accountId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/account`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting trading account ${accountId}:`, error.message);
      return null;
    }
  }

  async getPositions(accountId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/positions`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error getting positions for account ${accountId}:`, error.message);
      return [];
    }
  }

  // Watchlist methods
  async getWatchlists(accountId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/watchlists`
      );
      console.log(`[Alpaca] getWatchlists response:`, JSON.stringify(response.data, null, 2));
      return response.data || [];
    } catch (error) {
      console.error(`Error getting watchlists for account ${accountId}:`, error.message);
      return [];
    }
  }

  async getWatchlist(accountId, watchlistId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/watchlists/${watchlistId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting watchlist ${watchlistId}:`, error.message);
      return null;
    }
  }

  async createWatchlist(accountId, name, symbols = []) {
    try {
      const response = await this.makeAuthenticatedPost(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/watchlists`,
        { name, symbols }
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating watchlist:`, error.response?.data || error.message);
      throw error;
    }
  }

  async addToWatchlist(accountId, watchlistId, symbol) {
    try {
      console.log(`[Alpaca] Adding ${symbol} to watchlist ${watchlistId}`);
      const response = await this.makeAuthenticatedPost(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/watchlists/${watchlistId}`,
        { symbol }
      );
      console.log(`[Alpaca] addToWatchlist response:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      // Handle duplicate symbol error - symbol already exists, just fetch current watchlist
      if (error.response?.data?.code === 40010001) {
        console.log(`[Alpaca] Symbol ${symbol} already in watchlist, fetching current state`);
        return this.getWatchlist(accountId, watchlistId);
      }
      console.error(`Error adding ${symbol} to watchlist:`, error.response?.data || error.message);
      throw error;
    }
  }

  async removeFromWatchlist(accountId, watchlistId, symbol) {
    try {
      const response = await this.makeAuthenticatedDelete(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/watchlists/${watchlistId}/${symbol}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error removing ${symbol} from watchlist:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Portfolio history
  async getPortfolioHistory(accountId, period = '1M', timeframe = '1D') {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/account/portfolio/history`,
        { period, timeframe }
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting portfolio history for account ${accountId}:`, error.message);
      return null;
    }
  }

  // Get orders (for purchase history)
  async getOrders(accountId, status = 'all', limit = 100) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/orders`,
        { status, limit }
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error getting orders for account ${accountId}:`, error.message);
      return [];
    }
  }

  // Get account activities (for cash history reconstruction)
  async getAccountActivities(accountId, activityTypes = null, after = null, until = null) {
    try {
      const params = {};
      if (activityTypes) params.activity_types = activityTypes;
      if (after) params.after = after;
      if (until) params.until = until;

      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/trading/accounts/${accountId}/account/activities`,
        params
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error getting account activities for ${accountId}:`, error.message);
      return [];
    }
  }

  async getAccountById(accountId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/accounts/${accountId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting account ${accountId}:`, error.message);
      return null;
    }
  }

  async updateAccount(accountId, updates) {
    try {
      const response = await this.makeAuthenticatedPatch(
        `${this.brokerURL}/v1/accounts/${accountId}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating account ${accountId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getAllAccounts() {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/accounts`
      );
      const accountList = response.data || [];

      // Fetch full details for each account
      const fullAccounts = await Promise.all(
        accountList.map(acc => this.getAccountById(acc.id))
      );

      return fullAccounts.filter(acc => acc !== null);
    } catch (error) {
      console.error('Error getting all accounts:', error.message);
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
          asset = assets.find(a =>
            a.name.toLowerCase() === companyName.toLowerCase()
          ) || assets[0];
        }
      }

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

    return {
      ...financialRecord,
      alpaca: null
    };
  }
}

module.exports = AlpacaClient;
