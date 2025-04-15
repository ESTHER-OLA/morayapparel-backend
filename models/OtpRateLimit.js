// models/OtpRateLimit.js
const mongoose = require("mongoose");

const otpRateLimitSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires in 10 minutes
});

module.exports = mongoose.model("OtpRateLimit", otpRateLimitSchema);
