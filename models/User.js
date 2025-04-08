const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  address: { type: String },
  resetPasswordCode: String,
  createdAt: { type: Date, default: Date.now },
  otpCode: String,
  otpExpires: Date,
  otpPurpose: String,
});

module.exports = mongoose.model("User", UserSchema);
