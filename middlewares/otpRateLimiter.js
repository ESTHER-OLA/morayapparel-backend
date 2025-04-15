// middleware/otpRateLimiter.js
const OtpRateLimit = require("../models/OtpRateLimit");

const otpRateLimiter = async (req, res, next) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const record = await OtpRateLimit.findOne({ email });

    if (record) {
      if (record.count >= 5) {
        return res
          .status(429)
          .json({ message: "Too many OTP requests. Try again later." });
      }
      record.count += 1;
      await record.save();
    } else {
      await OtpRateLimit.create({ email });
    }

    next();
  } catch (error) {
    console.error("OTP Rate Limiter Error:", error);
    res.status(500).json({ message: "Server error while checking OTP limit" });
  }
};

module.exports = otpRateLimiter;
