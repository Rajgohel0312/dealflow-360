import crypto from 'crypto';
import CacheService from '../infrastructure/redis/redis.service.js';
import AppError from '../shared/errors/AppError.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Revoke a token (used during logout or password change)
 */
export async function revokeToken(token, ttlSeconds = 86400) {
  if (!token) return false;
  const hash = hashToken(token);
  const key = `dealflow:revoked_token:${hash}`;
  return await CacheService.set(key, { revokedAt: new Date().toISOString() }, ttlSeconds);
}

/**
 * Check if a token has been revoked
 */
export async function isTokenRevoked(token) {
  if (!token) return false;
  const hash = hashToken(token);
  const key = `dealflow:revoked_token:${hash}`;
  const revoked = await CacheService.get(key);
  return revoked !== null;
}

/**
 * Middleware to check token blacklist
 */
export const checkTokenBlacklist = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (await isTokenRevoked(token)) {
        throw new AppError('Token has been revoked. Please log in again.', 401);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
