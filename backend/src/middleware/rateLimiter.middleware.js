import CacheService from '../infrastructure/redis/redis.service.js';
import AppError from '../shared/errors/AppError.js';

/**
 * General API Rate Limiter Middleware
 * @param {Object} options { windowSec: 60, max: 100, keyPrefix: 'ratelimit' }
 */
export const rateLimiter = (options = {}) => {
  const windowSec = options.windowSec || 60;
  const maxRequests = options.max || 100;
  const keyPrefix = options.keyPrefix || 'ratelimit';

  return async (req, res, next) => {
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
      const routePath = req.path || req.url?.split('?')[0] || 'all';
      const key = `dealflow:${keyPrefix}:${clientIp}:${routePath}`;


      const count = await CacheService.incr(key, windowSec);

      if (count !== null) {
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));

        if (count > maxRequests) {
          throw new AppError('Too many requests. Please try again later.', 429);
        }
      }

      next();
    } catch (error) {
      if (error instanceof AppError) return next(error);
      // Fail-open if Redis encounters error so standard user requests aren't blocked
      next();
    }
  };
};
