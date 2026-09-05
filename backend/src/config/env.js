import 'dotenv/config';

export const env = {
    port: process.env.PORT || 5000,
    jwt_secret: process.env.JWT_SECRET,
    db: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        enabled: process.env.REDIS_ENABLED !== 'false',
    },
    environment: process.env.ENVIRONMENT || 'development',
};


