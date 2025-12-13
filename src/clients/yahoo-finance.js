const axios = require('axios');

class YahooFinanceClient {
  constructor(cache = null) {
    this.baseURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
    this.cache = cache;
    this.cacheTTL = {
      history: 300,   // 5 minutes for historical data
      quote: 60       // 1 minute for quotes
    };
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

    return this.cachedRequest(cacheKey, this.cacheTTL.history, async () => {
      const params = { interval };

      if (period1 && period2) {
        params.period1 = period1;
        params.period2 = period2;
      } else {
        params.range = range;
      }

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
        if (error.response?.data?.chart?.error) {
          throw new Error(error.response.data.chart.error.description);
        }
        throw error;
      }
    });
  }

  async getQuote(symbol) {
    const cacheKey = `yahoo:quote:${symbol}`;

    return this.cachedRequest(cacheKey, this.cacheTTL.quote, async () => {
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
