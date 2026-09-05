import Redis from 'ioredis';
import { env } from '../../config/env.js';

let isReady = false;
let redisClient = null;

if (env.redis.enabled) {
  try {
    redisClient = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password || undefined,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      retryStrategy(times) {
        if (times > 10) {
          console.warn('⚠️ Redis max retry limit reached. Falling back to DB mode.');
          return null; // Stop retrying automatically
        }
        const delay = Math.min(times * 300, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully.');
    });

    redisClient.on('ready', () => {
      isReady = true;
      console.log('🚀 Redis client ready for operations.');
    });

    redisClient.on('error', (err) => {
      isReady = false;
      console.error('⚠️ Redis error:', err.message);
    });

    redisClient.on('close', () => {
      isReady = false;
      console.warn('⚠️ Redis connection closed.');
    });
  } catch (err) {
    isReady = false;
    console.error('⚠️ Failed to initialize Redis client:', err.message);
  }
} else {
  console.log('ℹ️ Redis disabled via configuration.');
}

export function isRedisReady() {
  return isReady && redisClient !== null && redisClient.status === 'ready';
}

export default redisClient;
