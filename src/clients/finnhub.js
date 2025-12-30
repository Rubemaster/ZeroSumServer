const axios = require('axios');
const cacheRulesManager = require('../cache/cache-rules');

class FinnhubClient {
  constructor(apiKey, cache = null) {
    this.apiKey = apiKey;
    this.baseURL = 'https://finnhub.io/api/v1';
    this.cache = cache;
  }

  getTTL(key) {
    return cacheRulesManager.getTTL('finnhub', key);
  }

  async makeRequest(endpoint, params = {}) {
    const response = await axios.get(`${this.baseURL}${endpoint}`, {
      params: {
        ...params,
        token: this.apiKey
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

  async getQuote(symbol) {
    const sym = symbol.toUpperCase();
    const cacheKey = `finnhub:quote:${sym}`;

    return this.cachedRequest(cacheKey, this.getTTL('quote'), async () => {
      const data = await this.makeRequest('/quote', { symbol: sym });
      return {
        symbol: sym,
        currentPrice: data.c,
        change: data.d,
        percentChange: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        timestamp: data.t ? new Date(data.t * 1000).toISOString() : null
      };
    });
  }

  async getCandles(symbol, resolution = 'D', from, to) {
    const sym = symbol.toUpperCase();
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    const fromTs = from || thirtyDaysAgo;
    const toTs = to || now;

    const cacheKey = `finnhub:candles:${sym}:${resolution}:${fromTs}:${toTs}`;

    return this.cachedRequest(cacheKey, this.getTTL('candles'), async () => {
      const data = await this.makeRequest('/stock/candle', {
        symbol: sym,
        resolution,
        from: fromTs,
        to: toTs
      });

      if (data.s === 'no_data') {
        return { symbol: sym, resolution, bars: [], status: 'no_data' };
      }

      const bars = [];
      if (data.t && data.o && data.h && data.l && data.c && data.v) {
        for (let i = 0; i < data.t.length; i++) {
          bars.push({
            timestamp: new Date(data.t[i] * 1000).toISOString(),
            open: data.o[i],
            high: data.h[i],
            low: data.l[i],
            close: data.c[i],
            volume: data.v[i]
          });
        }
      }

      return { symbol: sym, resolution, bars, status: 'ok' };
    });
  }

  async getCompanyProfile(symbol) {
    const sym = symbol.toUpperCase();
    const cacheKey = `finnhub:profile:${sym}`;

    return this.cachedRequest(cacheKey, this.getTTL('profile'), async () => {
      return this.makeRequest('/stock/profile2', { symbol: sym });
    });
  }

  async searchSymbols(query) {
    const cacheKey = `finnhub:search:${query.toLowerCase()}`;

    return this.cachedRequest(cacheKey, this.getTTL('search'), async () => {
      const data = await this.makeRequest('/search', { q: query });
      return data.result || [];
    });
  }

  async getBasicFinancials(symbol) {
    const sym = symbol.toUpperCase();
    const cacheKey = `finnhub:financials:${sym}`;

    return this.cachedRequest(cacheKey, this.getTTL('financials'), async () => {
      return this.makeRequest('/stock/metric', { symbol: sym, metric: 'all' });
    });
  }

  async getNews(symbol = null, from = null, to = null) {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (symbol) {
      const sym = symbol.toUpperCase();
      const fromDate = from || thirtyDaysAgo;
      const toDate = to || today;
      const cacheKey = `finnhub:news:${sym}:${fromDate}:${toDate}`;

      return this.cachedRequest(cacheKey, this.getTTL('news'), async () => {
        return this.makeRequest('/company-news', {
          symbol: sym,
          from: fromDate,
          to: toDate
        });
      });
    } else {
      const cacheKey = `finnhub:news:general`;

      return this.cachedRequest(cacheKey, this.getTTL('news'), async () => {
        return this.makeRequest('/news', { category: 'general' });
      });
    }
  }

  async getEarningsCalendar(from = null, to = null, symbol = null) {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const params = {
      from: from || today,
      to: to || nextWeek
    };
    if (symbol) params.symbol = symbol.toUpperCase();

    return this.makeRequest('/calendar/earnings', params);
  }

  async getFinancialSeries(symbol, frequency = 'quarterly') {
    const sym = symbol.toUpperCase();
    const cacheKey = `finnhub:series:${sym}:${frequency}`;

    return this.cachedRequest(cacheKey, this.getTTL('financials'), async () => {
      const data = await this.makeRequest('/stock/metric', { symbol: sym, metric: 'all' });
      const series = frequency === 'quarterly' ? data.series?.quarterly : data.series?.annual;
      return {
        symbol: sym,
        frequency,
        series: series || {},
        metric: data.metric || {}
      };
    });
  }
}

module.exports = FinnhubClient;
