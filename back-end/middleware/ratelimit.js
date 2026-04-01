const rateLimit = require('../lib/redis');
const { createAndThrowError } = require('../javascripts/utils');

module.exports = async (req, res, next) => {
  try {
    const key = `ip:${req.ip}`;
    const { success, pending } = await rateLimit.limit(key, {
      ip: req.ip,
      userAgent: req.get('user-agent') || "unknown",
    });
    await pending;

    if (success) next();
    else createAndThrowError(429, "Too many requests", "TooManyRequestsError");
  } catch (error) {
    if (error.status === 429) return next(error);
    createAndThrowError(500, "An unexpected error has occurred", "InternalServerError");
  }
}