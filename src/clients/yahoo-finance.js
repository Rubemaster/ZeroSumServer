const axios = require('axios');
const cacheRulesManager = require('../cache/cache-rules');

class YahooFinanceClient {
  constructor(cache = null) {
    this.baseURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
    this.cache = cache;
    this.lastRequestTime = 0;
    this.minRequestInterval = 500; // Minimum 500ms between Yahoo API calls
  }

  getTTL(key) {
    return cacheRulesManager.getTTL('yahoo', key);
  }

  async throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  async cachedRequest(cacheKey, ttl, fetchFn) {
    if (this.cache) {
      const result = await this.cache.getOrFetch(cacheKey, fetchFn, ttl);
      return result.data;
    }
    return fetchFn();
  }

  async getHistory(symbol, options = {}) {
    const {
      range = '1y',
      interval = '1d',
      period1,
      period2
    } = options;

    const cacheKey = period1 && period2
      ? `yahoo:history:${symbol}:${interval}:${period1}:${period2}`
      : `yahoo:history:${symbol}:${range}:${interval}`;

    // Use longer cache TTL for historical data that's already complete (before current year)
    const currentYearStart = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000);
    const isArchiveData = period2 && parseInt(period2) < currentYearStart;
    const ttl = isArchiveData ? this.getTTL('historyArchive') : this.getTTL('history');

    return this.cachedRequest(cacheKey, ttl, async () => {
      const params = { interval };

      if (period1 && period2) {
        params.period1 = period1;
        params.period2 = period2;
      } else {
        params.range = range;
      }

      // Throttle requests to avoid rate limiting
      await this.throttle();

      // Retry logic for rate limiting
      const maxRetries = 3;
      let lastError;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await axios.get(`${this.baseURL}/${symbol}`, {
            params,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
          });

          const result = response.data.chart.result[0];
          const meta = result.meta;
          const timestamps = result.timestamp || [];
          const quote = result.indicators.quote[0];
          const adjClose = result.indicators.adjclose?.[0]?.adjclose;

          const bars = timestamps.map((timestamp, i) => ({
            timestamp: new Date(timestamp * 1000).toISOString(),
            open: quote.open[i],
            high: quote.high[i],
            low: quote.low[i],
            close: quote.close[i],
            volume: quote.volume[i],
            adjClose: adjClose ? adjClose[i] : quote.close[i]
          })).filter(bar => bar.open !== null);

          return {
            symbol: meta.symbol,
            currency: meta.currency,
            exchangeName: meta.exchangeName,
            instrumentType: meta.instrumentType,
            range,
            interval,
            bars
          };
        } catch (error) {
          lastError = error;

          // Check for rate limit (429)
          if (error.response?.status === 429) {
            const backoffDelay = 5000 * Math.pow(2, attempt); // 5s, 10s, 20s
            console.log(`[Yahoo] Rate limited for ${symbol}, waiting ${backoffDelay / 1000}s before retry ${attempt + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue;
          }

          // For other errors, throw immediately
          if (error.response?.data?.chart?.error) {
            throw new Error(error.response.data.chart.error.description);
          }
          throw error;
        }
      }

      // All retries exhausted
      if (lastError?.response?.data?.chart?.error) {
        throw new Error(lastError.response.data.chart.error.description);
      }
      throw lastError;
    });
  }

  async getQuote(symbol) {
    const cacheKey = `yahoo:quote:${symbol}`;

    return this.cachedRequest(cacheKey, this.getTTL('quote'), async () => {
      try {
        const response = await axios.get(`${this.baseURL}/${symbol}`, {
          params: { range: '1d', interval: '1m' },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });

        const result = response.data.chart.result[0];
        const meta = result.meta;

        return {
          symbol: meta.symbol,
          regularMarketPrice: meta.regularMarketPrice,
          previousClose: meta.previousClose,
          change: meta.regularMarketPrice - meta.previousClose,
          changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
          regularMarketDayHigh: meta.regularMarketDayHigh,
          regularMarketDayLow: meta.regularMarketDayLow,
          regularMarketVolume: meta.regularMarketVolume,
          currency: meta.currency,
          exchangeName: meta.exchangeName
        };
      } catch (error) {
        if (error.response?.data?.chart?.error) {
          throw new Error(error.response.data.chart.error.description);
        }
        throw error;
      }
    });
  }
}

module.exports = YahooFinanceClient;
