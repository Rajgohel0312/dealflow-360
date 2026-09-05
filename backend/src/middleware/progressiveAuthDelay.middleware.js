import CacheService from '../infrastructure/redis/redis.service.js';
import AppError from '../shared/errors/AppError.js';

const FAIL_KEY_PREFIX = 'dealflow:auth:fails';
const MAX_FAIL_ATTEMPTS = 5;
const LOCKOUT_TTL_SECONDS = 900; // 15 minutes

/**
 * Middleware executed BEFORE auth (login/register) endpoints to check if IP/Identity is delayed or locked out.
 */
export const checkAuthDelay = async (req, res, next) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    const identifier = req.body?.email || req.body?.username || clientIp;
    const key = `${FAIL_KEY_PREFIX}:${identifier}`;

    const failCount = (await CacheService.get(key)) || 0;

    if (failCount >= MAX_FAIL_ATTEMPTS) {
      throw new AppError(
        'Too many failed attempts. Access temporarily locked for security. Please try again in 15 minutes.',
        429
      );
    }

    // Apply progressive delay if 3 or 4 failures occurred
    if (failCount >= 3) {
      const delayMs = (failCount - 2) * 2000; // 3rd fail: 2000ms delay, 4th fail: 4000ms delay
      console.warn(`⏳ Applying progressive auth delay of ${delayMs}ms for ${identifier}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Record a failed login or registration attempt.
 * Increments failure count in Redis and updates lock TTL.
 */
export const recordAuthFailure = async (req) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    const identifier = req.body?.email || req.body?.username || clientIp;
    const key = `${FAIL_KEY_PREFIX}:${identifier}`;

    const currentCount = (await CacheService.get(key)) || 0;
    const newCount = currentCount + 1;

    await CacheService.set(key, newCount, LOCKOUT_TTL_SECONDS);
    console.warn(`⚠️ Auth failure recorded for ${identifier}. Count: ${newCount}/${MAX_FAIL_ATTEMPTS}`);
    return newCount;
  } catch (error) {
    console.error('Error recording auth failure in Redis:', error.message);
    return 0;
  }
};

/**
 * Reset failure counter on successful auth.
 */
export const resetAuthFailure = async (req) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    const identifier = req.body?.email || req.body?.username || clientIp;
    const key = `${FAIL_KEY_PREFIX}:${identifier}`;

    await CacheService.del(key);
  } catch (error) {
    console.error('Error resetting auth failure count:', error.message);
  }
};
