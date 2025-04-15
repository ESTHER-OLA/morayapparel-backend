// controllers/otpController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");
const Admin = require("../models/Admin");

exports.verifyOtpAndCompleteSignup = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

    if (otpRecord.otpPurpose !== purpose)
      return res.status(400).json({ message: "OTP purpose mismatch" });

    if (otpRecord.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, otpRecord.otpCode);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    const Model = otpRecord.isAdmin ? Admin : User;
    const existing = await Model.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({
          message: `${otpRecord.isAdmin ? "Admin" : "User"} already exists`,
        });

    const hashedPassword = await bcrypt.hash(otpRecord.password, 10);

    const newRecord = new Model({
      firstName: otpRecord.firstName,
      lastName: otpRecord.lastName,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    await newRecord.save();
    await Otp.deleteOne({ email });

    res
      .status(201)
      .json({
        message: `${otpRecord.isAdmin ? "Admin" : "User"} signup completed`,
      });
  } catch (error) {
    console.error("Unified OTP Verification Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
