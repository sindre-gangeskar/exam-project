const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');

const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  prefix: '@exam/api',
  enableProtection: true,
  analytics: true
})

module.exports = rateLimit;