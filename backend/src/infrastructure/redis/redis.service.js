import redisClient, { isRedisReady } from './redis.client.js';

export const CacheService = {
  /**
   * Get value from Redis cache
   */
  async get(key) {
    if (!isRedisReady()) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache GET error for key "${key}":`, error.message);
      return null;
    }
  },

  /**
   * Set value in Redis cache with TTL in seconds
   */
  async set(key, value, ttlSeconds = 300) {
    if (!isRedisReady()) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Cache SET error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Delete single key
   */
  async del(key) {
    if (!isRedisReady()) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DEL error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Delete all keys matching a pattern using SCAN (non-blocking)
   */
  async delByPattern(pattern) {
    if (!isRedisReady()) return false;
    try {
      let stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on('data', async (keys = []) => {
        if (keys.length) {
          const pipeline = redisClient.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        }
      });

      return true;
    } catch (error) {
      console.error(`Cache DEL BY PATTERN error for "${pattern}":`, error.message);
      return false;
    }
  },

  /**
   * Increment counter with optional TTL
   */
  async incr(key, ttlSeconds = null) {
    if (!isRedisReady()) return null;
    try {
      const count = await redisClient.incr(key);
      if (count === 1 && ttlSeconds) {
        await redisClient.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      console.error(`Cache INCR error for key "${key}":`, error.message);
      return null;
    }
  },

  /**
   * Read-through cache wrapper (Fetches from cache; on miss, runs fetchFn and stores in cache)
   */
  async remember(key, ttlSeconds, fetchFn) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const freshData = await fetchFn();
    if (freshData !== undefined && freshData !== null) {
      await this.set(key, freshData, ttlSeconds);
    }
    return freshData;
  },

  /**
   * Acquire a distributed lock
   */
  async acquireLock(lockKey, ttlMs = 5000) {
    if (!isRedisReady()) return { acquired: true, lockValue: null }; // Fail-open fallback if Redis is down
    const lockValue = `${Date.now()}_${Math.random()}`;
    try {
      const result = await redisClient.set(lockKey, lockValue, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        return { acquired: true, lockValue };
      }
      return { acquired: false, lockValue: null };
    } catch (error) {
      console.error(`Lock ACQUIRE error for "${lockKey}":`, error.message);
      return { acquired: true, lockValue: null }; // Fail-open to avoid locking out operations when Redis fails
    }
  },

  /**
   * Release a distributed lock atomically using Lua script
   */
  async releaseLock(lockKey, lockValue) {
    if (!isRedisReady() || !lockValue) return true;
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    try {
      await redisClient.eval(luaScript, 1, lockKey, lockValue);
      return true;
    } catch (error) {
      console.error(`Lock RELEASE error for "${lockKey}":`, error.message);
      return false;
    }
  },
};

export default CacheService;
