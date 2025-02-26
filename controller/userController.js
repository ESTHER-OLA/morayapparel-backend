const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
require("dotenv").config();

// Standard signup controller
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login instead." });
    }
    // Hash the password and create a new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

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

// Transporter setup for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

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

    // Generate reset code for normal users
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(resetCode, 10);
    user.resetPasswordCode = hashedCode;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    });

    res.json({ message: "Reset code sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Verify reset code
    const isCodeValid = await bcrypt.compare(resetCode, user.resetPasswordCode);
    if (!isCodeValid) return res.status(400).json({ message: "Incorrect reset code" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = undefined; // Clear reset code

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
        message: "This account is not linked to Google. Use password reset instead.",
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
    const { firstName, lastName, phoneNumber, country, state, city, address } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !phoneNumber || !country || !state || !city || !address) {
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

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
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

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
