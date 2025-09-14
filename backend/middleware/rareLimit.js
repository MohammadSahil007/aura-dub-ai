// backend/middleware/rateLimit.js
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL);

const opts = {
  storeClient: redisClient,
  keyPrefix: 'rlflx',
  points: 10, // 10 requests
  duration: 60, // per 60 sec
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
