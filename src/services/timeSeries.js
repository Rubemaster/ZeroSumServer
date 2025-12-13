/**
 * Time Series Calculation Framework
 *
 * Provides a reusable structure for computing financial metrics over time
 * with forward-fill logic for sparse data.
 */

class TimeSeriesCalculator {
  constructor(finnhubClient) {
    this.finnhubClient = finnhubClient;
  }

  /**
   * Build a lookup map from an array of {period, v} objects
   */
  buildMap(arr) {
    const map = new Map();
    (arr || []).forEach(item => map.set(item.period, item.v));
    return map;
  }

  /**
   * Get all unique sorted dates from multiple series
   */
  getAllDates(...seriesArrays) {
    const allDates = new Set();
    for (const arr of seriesArrays) {
      (arr || []).forEach(item => allDates.add(item.period));
    }
    return [...allDates].sort();
  }

  /**
   * Compute TTM from quarterly values (rolling 4-quarter sum)
   */
  computeTTM(quarters) {
    if (quarters.length < 4) return null;
    return quarters.slice(-4).reduce((a, b) => a + b, 0);
  }

  /**
   * Format value to billions
   */
  toBillions(val) {
    return val ? parseFloat((val / 1e9).toFixed(2)) : null;
  }

  /**
   * Generic time-series calculation with forward-fill
   *
   * @param {string} symbol - Stock symbol
   * @param {object} config - Calculation configuration
   * @param {string[]} config.requiredSeries - Series names needed from Finnhub
   * @param {string[]} config.ttmSeries - Series to forward-fill (TTM values)
   * @param {string[]} config.quarterlySeries - Series to accumulate into TTM
   * @param {function} config.calculate - Function(context) => calculated values
   * @returns {object} - Time series results
   */
  async calculate(symbol, config) {
    const [seriesData, profile] = await Promise.all([
      this.finnhubClient.getFinancialSeries(symbol, 'quarterly'),
      this.finnhubClient.getCompanyProfile(symbol)
    ]);

    const series = seriesData.series;
    const sharesOutstanding = profile.shareOutstanding * 1e6;

    // Build maps for all required series (reverse for chronological order)
    const maps = {};
    const allSeriesArrays = [];

    for (const name of config.requiredSeries || []) {
      const arr = (series[name] || []).slice().reverse();
      maps[name] = this.buildMap(arr);
      allSeriesArrays.push(arr);
    }

    // Get all unique dates
    const sortedDates = this.getAllDates(...allSeriesArrays);

    // State tracking
    const state = {
      ttmValues: {},      // Forward-filled TTM values
      quarterlyQueues: {}, // Rolling 4-quarter queues
      computedTTM: {}     // Computed TTM from quarters
    };

    // Initialize state for TTM series (forward-fill)
    for (const name of config.ttmSeries || []) {
      state.ttmValues[name] = null;
    }

    // Initialize state for quarterly series (accumulate to TTM)
    for (const name of config.quarterlySeries || []) {
      state.quarterlyQueues[name] = [];
      state.computedTTM[name] = null;
    }

    const history = [];

    for (const date of sortedDates) {
      // Update forward-filled TTM values
      for (const name of config.ttmSeries || []) {
        if (maps[name]?.has(date)) {
          state.ttmValues[name] = maps[name].get(date);
        }
      }

      // Update quarterly queues and compute TTM
      for (const name of config.quarterlySeries || []) {
        if (maps[name]?.has(date)) {
          const qVal = maps[name].get(date);
          state.quarterlyQueues[name].push(qVal);
          if (state.quarterlyQueues[name].length > 4) {
            state.quarterlyQueues[name].shift();
          }
          if (state.quarterlyQueues[name].length === 4) {
            state.computedTTM[name] = this.computeTTM(state.quarterlyQueues[name]);
          }
        }
      }

      // Build context for calculation
      const context = {
        date,
        sharesOutstanding,
        ttm: state.ttmValues,
        computed: state.computedTTM,
        quarters: state.quarterlyQueues,
        maps,
        toBillions: this.toBillions
      };

      // Run the calculation
      const result = config.calculate(context);

      // Skip if calculation returns null (missing required data)
      if (result === null) continue;

      history.push({ date, ...result });
    }

    return {
      symbol: symbol.toUpperCase(),
      sharesOutstanding: Math.round(sharesOutstanding),
      dataPoints: history.length,
      history
    };
  }
}

// ============ Calculation Configurations ============

const CALCULATIONS = {
  /**
   * Graham Assets Estimation
   * Estimates total assets using Asset Turnover and ROA methods
   */
  assets: {
    requiredSeries: [
      'assetTurnoverTTM', 'roaTTM', 'salesPerShare', 'eps',
      'currentRatio', 'quickRatio', 'grossMargin', 'inventoryTurnoverTTM'
    ],
    ttmSeries: [
      'assetTurnoverTTM', 'roaTTM',
      'currentRatio', 'quickRatio', 'grossMargin', 'inventoryTurnoverTTM'
    ],
    quarterlySeries: ['salesPerShare', 'eps'],
    calculate: (ctx) => {
      const { ttm, computed, sharesOutstanding, toBillions } = ctx;

      // Need core values for total assets
      if (ttm.assetTurnoverTTM === null || ttm.roaTTM === null ||
          computed.salesPerShare === null || computed.eps === null) {
        return null;
      }

      const ttmRevenue = computed.salesPerShare * sharesOutstanding;
      const ttmNetIncome = computed.eps * sharesOutstanding;

      // Method 1: Asset Turnover - Assets = TTM Revenue / assetTurnoverTTM
      const assets1 = ttm.assetTurnoverTTM > 0 ? ttmRevenue / ttm.assetTurnoverTTM : null;

      // Method 2: ROA - Assets = TTM Net Income / roaTTM
      // Note: roaTTM is already expressed as a decimal (0.328 = 32.8%)
      const assets2 = ttm.roaTTM > 0 ? ttmNetIncome / ttm.roaTTM : null;

      // Conservative and best for total assets
      const validAssets = [assets1, assets2].filter(v => v !== null && v > 0);
      const conservative = validAssets.length > 0 ? Math.min(...validAssets) : null;
      const best = assets1; // Asset Turnover method preferred

      // Current Assets calculation (using Current Ratio approach)
      let currentAssets = null;
      let currentLiabilities = null;

      const cr = ttm.currentRatio;
      const qr = ttm.quickRatio;
      const gm = ttm.grossMargin;
      const invTurnover = ttm.inventoryTurnoverTTM;

      if (cr !== null && qr !== null && gm !== null && invTurnover !== null) {
        const ratioDiff = cr - qr;
        if (ratioDiff > 0 && invTurnover > 0) {
          // COGS = Revenue × (1 - Gross Margin)
          const cogs = ttmRevenue * (1 - gm);
          // Inventory = COGS / Inventory Turnover
          const inventory = cogs / invTurnover;
          // Current Liabilities = Inventory / (CR - QR)
          currentLiabilities = inventory / ratioDiff;
          // Current Assets = CR × Current Liabilities
          currentAssets = cr * currentLiabilities;
        }
      }

      return {
        assets1: toBillions(assets1),
        assets2: toBillions(assets2),
        conservative: toBillions(conservative),
        best: toBillions(best),
        currentAssets: toBillions(currentAssets),
        currentLiabilities: toBillions(currentLiabilities)
      };
    }
  },

  /**
   * Revenue Estimation (Sales / Revenue from Contracts with Customers)
   *
   * Uses salesPerShare which represents Revenue from Contracts with Customers
   * (ASC 606 - product/service sales). For most companies this is the primary
   * revenue source.
   *
   * Note: Finnhub's quarterly series only provides salesPerShare, not total revenue.
   * For point-in-time total revenue, use the /api/market/financials endpoint.
   */
  revenue: {
    requiredSeries: ['salesPerShare'],
    ttmSeries: [],
    quarterlySeries: ['salesPerShare'],
    calculate: (ctx) => {
      const { computed, sharesOutstanding, toBillions } = ctx;

      // Sales Per Share (Revenue from Contracts with Customers)
      // TTM computed from quarterly sum × Shares
      const salesRevenue = computed.salesPerShare !== null
        ? computed.salesPerShare * sharesOutstanding
        : null;

      // Need data to calculate
      if (salesRevenue === null) {
        return null;
      }

      return {
        salesRevenue: toBillions(salesRevenue),  // Revenue from Contracts with Customers (TTM)
        best: toBillions(salesRevenue)
      };
    }
  }
};

module.exports = { TimeSeriesCalculator, CALCULATIONS };
