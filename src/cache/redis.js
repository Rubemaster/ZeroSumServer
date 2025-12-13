const { createClient } = require('redis');

class RedisCache {
  constructor(options = {}) {
    this.client = null;
    this.connected = false;
    this.url = options.url || process.env.REDIS_URL || 'redis://localhost:6379';
    this.defaultTTL = options.defaultTTL || 300; // 5 minutes default
  }

  async connect() {
    try {
      this.client = createClient({ url: this.url });
      this.client.on('error', (err) => {
        console.error('Redis error:', err.message);
        this.connected = false;
      });
      await this.client.connect();
      this.connected = true;
      console.log('Redis cache connected');
    } catch (error) {
      console.error('Redis connection failed:', error.message);
      this.connected = false;
    }
  }

  async get(key) {
    if (!this.connected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!this.connected) return false;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error.message);
      return false;
    }
  }

  async getOrFetch(key, fetchFn, ttl = this.defaultTTL) {
    // Try cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    // Fetch fresh data
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return { data, fromCache: false };
  }

  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }
}

module.exports = RedisCache;
