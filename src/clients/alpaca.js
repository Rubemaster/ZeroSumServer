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
      const response = await this.makeAuthenticatedRequest(
        `${this.brokerURL}/v1/accounts`,
        { query: email }
      );

      // Find account with matching email
      const accounts = response.data;
      if (accounts && accounts.length > 0) {
        const account = accounts.find(acc =>
          acc.contact?.email_address?.toLowerCase() === email.toLowerCase()
        );
        return account || null;
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
