const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = new Redis(redisUrl);

const opts = {
  storeClient: redisClient,
  keyPrefix: 'rlflx',
  points: parseInt(process.env.RATE_LIMIT_MAX || 10, 10),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW || 60, 10),
};

const rateLimiter = new RateLimiterRedis(opts);

module.exports = async (req, res, next) => {
  const key = req.headers.authorization?.split(' ')[1] || req.ip;
  try {
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
};