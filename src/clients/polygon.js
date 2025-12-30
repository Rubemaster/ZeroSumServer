const axios = require('axios');
const cacheRulesManager = require('../cache/cache-rules');

class PolygonClient {
  constructor(apiKey, cache = null) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.polygon.io';
    this.cache = cache;
  }

  getTTL(key) {
    return cacheRulesManager.getTTL('polygon', key);
  }

  async makeRequest(endpoint, params = {}) {
    const response = await axios.get(`${this.baseURL}${endpoint}`, {
      params: {
        ...params,
        apiKey: this.apiKey
      }
    });
    return response.data;
  }

  async cachedRequest(cacheKey, ttl, fetchFn) {
    if (this.cache) {
      const result = await this.cache.getOrFetch(cacheKey, fetchFn, ttl);
      return result.data;
    }
    return fetchFn();
  }

  /**
   * Get all active NYSE-listed common equity securities (primary listing only)
   * @returns {Promise<Array<{symbol: string, name: string}>>}
   */
  async getNYSECommonStocks() {
    const cacheKey = 'polygon:nyse-common-stocks-v4';

    return this.cachedRequest(cacheKey, this.getTTL('tickers'), async () => {
      const allTickers = [];
      let cursor = null;
      let pageCount = 0;
      const maxPages = 50; // Safety limit

      do {
        const params = {
          market: 'stocks',
          exchange: 'XNYS',  // NYSE exchange
          type: 'CS',        // Common Stock only
          active: true,
          limit: 1000,
        };

        if (cursor) {
          params.cursor = cursor;
        }

        console.log(`[Polygon] Fetching NYSE stocks page ${pageCount + 1}...`);
        const data = await this.makeRequest('/v3/reference/tickers', params);

        if (data.results && data.results.length > 0) {
          for (const ticker of data.results) {
            // Only include stocks where NYSE is the PRIMARY exchange
            if (ticker.primary_exchange === 'XNYS') {
              allTickers.push({
                symbol: ticker.ticker,
                name: ticker.name,
              });
            }
          }
        }

        cursor = data.next_url ? new URL(data.next_url).searchParams.get('cursor') : null;
        pageCount++;

      } while (cursor && pageCount < maxPages);

      console.log(`[Polygon] Fetched ${allTickers.length} NYSE common stocks in ${pageCount} pages`);

      // Sort alphabetically by symbol
      allTickers.sort((a, b) => a.symbol.localeCompare(b.symbol));

      return allTickers;
    });
  }

  /**
   * Get ticker details
   * @param {string} symbol - Stock symbol
   */
  async getTickerDetails(symbol) {
    const sym = symbol.toUpperCase();
    const cacheKey = `polygon:ticker:${sym}`;

    return this.cachedRequest(cacheKey, this.getTTL('tickerDetails'), async () => {
      const data = await this.makeRequest(`/v3/reference/tickers/${sym}`);
      return data.results;
    });
  }
}

module.exports = PolygonClient;
