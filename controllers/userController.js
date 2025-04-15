const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendOTP = require("../utils/sendOTP");
// const OTP = require("../models/UserOtp");
require("dotenv").config();

// Updated user signup
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login instead." });
    }

    // Send OTP with data saved in OTP model
    await sendOTP(email, "signup", {
      firstName,
      lastName,
      password,
      isAdmin: false,
    });

    res
      .status(200)
      .json({ message: "OTP sent to email. Verify to complete signup." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// exports.otpVerification = async (req, res) => {
//   try {
//     const { email, otp, purpose } = req.body;

//     // Fetch OTP record
//     const otpRecord = await OTP.findOne({ email });
//     if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

//     if (otpRecord.otpPurpose !== purpose)
//       return res.status(400).json({ message: "OTP purpose mismatch" });

//     if (otpRecord.otpExpires < Date.now())
//       return res.status(400).json({ message: "OTP expired" });

//     const isMatch = await bcrypt.compare(otp, otpRecord.otpCode);
//     if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

//     // Prevent duplicate user
//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ message: "User already exists" });

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(otpRecord.password, salt);

//     // Create the user
//     const newUser = new User({
//       firstName: otpRecord.firstName,
//       lastName: otpRecord.lastName,
//       email,
//       password: hashedPassword,
//       isVerified: true,
//       isAdmin: otpRecord.isAdmin || false,
//     });

//     await newUser.save();

//     // Clean up OTP record
//     await OTP.deleteOne({ email });

//     res.status(201).json({ message: "Signup completed successfully" });
//   } catch (error) {
//     console.error("OTP Verification Error:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// Standard login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "User does not exist. Please signup" });
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Protected profile controller
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Password reset request
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user signed up via Google
    if (user.password.includes(process.env.JWT_SECRET)) {
      return res.json({
        message:
          "This account was created using Google. Please set a new password instead.",
      });
    }
    await sendOTP(email, "reset-password");
    res.json({ message: "Reset code sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otpPurpose !== "reset-password")
      return res.status(400).json({ message: "Invalid OTP purpose" });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, user.otpCode);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpPurpose = undefined;

    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.setNewPasswordForGoogleUser = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user is a Google user
    if (!user.password.includes(process.env.JWT_SECRET)) {
      return res.status(400).json({
        message:
          "This account is not linked to Google. Use password reset instead.",
      });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password set successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Save user profile details (Delivery Details)
exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const { firstName, lastName, phoneNumber, country, state, city, address } =
      req.body;

    // Check if all required fields are provided
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !country ||
      !state ||
      !city ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Update the user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phoneNumber, country, state, city, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user profile details
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update user profile details
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body; // Fields to update

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
