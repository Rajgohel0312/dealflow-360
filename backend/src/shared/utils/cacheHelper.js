import CacheService from '../../infrastructure/redis/redis.service.js';

/**
 * Cache helper for wrapping service/repo read operations with automatic TTL and key management
 */
export async function withCache(cacheKey, ttlSeconds, fetchFn) {
  return await CacheService.remember(cacheKey, ttlSeconds, fetchFn);
}

/**
 * Invalidate single key or pattern after mutation operations (insert/update/delete)
 */
export async function invalidateCache(keyOrPattern) {
  if (keyOrPattern.includes('*')) {
    return await CacheService.delByPattern(keyOrPattern);
  }
  return await CacheService.del(keyOrPattern);
}
