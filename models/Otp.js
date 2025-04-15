// models/Otp.js (shared by both)
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpCode: { type: String, required: true },
  otpPurpose: { type: String, required: true }, // 'signup' | 'reset-password'
  otpExpires: { type: Date, required: true },
  firstName: String,
  lastName: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("Otp", otpSchema);
