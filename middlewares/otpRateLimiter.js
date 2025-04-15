// middleware/otpRateLimiter.js
const redis = require("../config/redis");

const otpRateLimiter = async (req, res, next) => {
  const { email } = req.body;
  const key = `otp_request:${email}`;

  const current = await redis.get(key);

  if (current && parseInt(current) >= 5) {
    return res.status(429).json({ message: "Too many OTP requests. Try again later." });
  }

  await redis.incr(key);
  await redis.expire(key, 60 * 10); // 10-minute window

  next();
};

module.exports = otpRateLimiter;
