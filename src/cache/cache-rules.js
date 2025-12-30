const fs = require('fs');
const path = require('path');

class CacheRulesManager {
  constructor() {
    this.configPath = path.join(__dirname, '../../config/cache-rules.json');
    this.rules = null;
    this.defaultTTL = 300; // 5 minutes fallback
  }

  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.rules = JSON.parse(data);
        console.log('Cache rules loaded from config file');
      } else {
        // Initialize with defaults if file doesn't exist
        this.rules = {
          finnhub: {
            quote: 60,
            candles: 300,
            profile: 86400,
            financials: 3600,
            search: 86400,
            news: 300
          },
          polygon: {
            tickers: 86400,
            tickerDetails: 86400
          },
          yahoo: {
            history: 300,
            historyArchive: 86400,
            quote: 60
          },
          default: 300
        };
        this.save();
        console.log('Cache rules initialized with defaults');
      }
    } catch (error) {
      console.error('Error loading cache rules:', error.message);
      this.rules = { default: this.defaultTTL };
    }
  }

  save() {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.rules, null, 2));
      console.log('Cache rules saved to config file');
      return true;
    } catch (error) {
      console.error('Error saving cache rules:', error.message);
      return false;
    }
  }

  getTTL(client, key) {
    if (!this.rules) {
      this.load();
    }

    // Check for client-specific TTL
    if (this.rules[client] && typeof this.rules[client][key] === 'number') {
      return this.rules[client][key];
    }

    // Fall back to default TTL
    return this.rules.default || this.defaultTTL;
  }

  getRules() {
    if (!this.rules) {
      this.load();
    }
    return { ...this.rules };
  }

  updateRules(newRules) {
    this.rules = { ...newRules };
    return this.save();
  }

  updateClientRules(client, clientRules) {
    if (!this.rules) {
      this.load();
    }
    this.rules[client] = { ...clientRules };
    return this.save();
  }

  updateSingleRule(client, key, ttl) {
    if (!this.rules) {
      this.load();
    }
    if (!this.rules[client]) {
      this.rules[client] = {};
    }
    this.rules[client][key] = ttl;
    return this.save();
  }
}

// Singleton instance
const cacheRulesManager = new CacheRulesManager();

module.exports = cacheRulesManager;
