const rateLimit = require('../lib/redis');
const { createAndThrowError } = require('../javascripts/utils');

module.exports = async (req, res, next) => {
  try {
    const key = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
    const { success } = await rateLimit.limit(key, {
      ip: req.ip,
      userAgent: req.get('user-agent') || "unknown"
    });

    if (success) next();
    else createAndThrowError(429, "Too many requests", "TooManyRequestsError");
  } catch (error) {
    console.error(error);
    if (error.status === 429) return next(error);
    createAndThrowError(500, "An unexpected error has occurred", "InternalServerError");
  }
}