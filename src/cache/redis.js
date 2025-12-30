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

  // Store permanently (no TTL)
  async setPermanent(key, value) {
    if (!this.connected) return false;
    try {
      await this.client.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis setPermanent error:', error.message);
      return false;
    }
  }

  // Add item to a sorted set with score (for timeline)
  async addToSortedSet(key, score, value) {
    if (!this.connected) return false;
    try {
      await this.client.zAdd(key, { score, value: JSON.stringify(value) });
      return true;
    } catch (error) {
      console.error('Redis addToSortedSet error:', error.message);
      return false;
    }
  }

  // Get items from sorted set by score range (descending - newest first)
  async getFromSortedSet(key, start = 0, end = -1) {
    if (!this.connected) return [];
    try {
      const results = await this.client.zRange(key, start, end, { REV: true });
      return results.map(item => JSON.parse(item));
    } catch (error) {
      console.error('Redis getFromSortedSet error:', error.message);
      return [];
    }
  }

  // Check if member exists in sorted set
  async existsInSortedSet(key, value) {
    if (!this.connected) return false;
    try {
      const score = await this.client.zScore(key, JSON.stringify(value));
      return score !== null;
    } catch (error) {
      console.error('Redis existsInSortedSet error:', error.message);
      return false;
    }
  }

  // Check if a filing ID exists (by checking a simple key)
  async hasFilingId(id) {
    if (!this.connected) return false;
    try {
      const exists = await this.client.exists(`sec:filing:${id}`);
      return exists === 1;
    } catch (error) {
      console.error('Redis hasFilingId error:', error.message);
      return false;
    }
  }

  // Get count of items in sorted set
  async getSortedSetCount(key) {
    if (!this.connected) return 0;
    try {
      return await this.client.zCard(key);
    } catch (error) {
      console.error('Redis getSortedSetCount error:', error.message);
      return 0;
    }
  }

  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  async clearByPrefix(prefix) {
    if (!this.connected) return { success: false, deleted: 0 };
    try {
      let cursor = '0';
      let totalDeleted = 0;

      do {
        const result = await this.client.scan(cursor, {
          MATCH: `${prefix}:*`,
          COUNT: 100
        });
        cursor = String(result.cursor);
        const keys = result.keys;

        if (keys.length > 0) {
          await this.client.del(keys);
          totalDeleted += keys.length;
        }
      } while (cursor !== '0');

      return { success: true, deleted: totalDeleted };
    } catch (error) {
      console.error('Redis clearByPrefix error:', error.message);
      return { success: false, deleted: 0 };
    }
  }

  async getCacheStats() {
    if (!this.connected) return null;
    try {
      const stats = {
        finnhub: { count: 0, size: 0 },
        polygon: { count: 0, size: 0 },
        yahoo: { count: 0, size: 0 },
        sec: { count: 0, size: 0 },
        other: { count: 0, size: 0 },
      };

      let cursor = '0';
      do {
        const result = await this.client.scan(cursor, { COUNT: 100 });
        cursor = String(result.cursor);
        const keys = result.keys;

        for (const key of keys) {
          let memoryUsage = 0;
          try {
            memoryUsage = await this.client.memoryUsage(key) || 0;
          } catch {
            memoryUsage = 0;
          }

          if (key.startsWith('finnhub:')) {
            stats.finnhub.count++;
            stats.finnhub.size += memoryUsage;
          } else if (key.startsWith('polygon:')) {
            stats.polygon.count++;
            stats.polygon.size += memoryUsage;
          } else if (key.startsWith('yahoo:')) {
            stats.yahoo.count++;
            stats.yahoo.size += memoryUsage;
          } else if (key.startsWith('sec:')) {
            stats.sec.count++;
            stats.sec.size += memoryUsage;
          } else {
            stats.other.count++;
            stats.other.size += memoryUsage;
          }
        }
      } while (cursor !== '0');

      return stats;
    } catch (error) {
      console.error('Redis getCacheStats error:', error.message);
      return null;
    }
  }
}

module.exports = RedisCache;
