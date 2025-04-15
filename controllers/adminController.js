const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOTP");
const transporter = require("../config/transporter");
require("dotenv").config();

// Function to send email alerts
const sendEmailAlert = async (email, action, res) => {
  const mailOptions = {
    from: process.env.BUSINESS_SUPPORT_EMAIL,
    to: process.env.BUSINESS_SUPPORT_EMAIL, // Send to business support
    subject: "Admin Secret Key Validation Request",
    text: `An admin is attempting to ${action}. If this is authorized, respond with "APPROVED". Otherwise, respond with "REJECTED".`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(401).json({
      message: "Secret key validation pending. Check business support email.",
    });
  } catch (error) {
    console.error("Email alert error:", error); // Add this line to log real error
    res.status(500).json({
      message: "Failed to send email alert",
      error: error?.message || error.toString(),
    });    
  }
};

// Admin Signup - Step 1: Validate and send OTP
exports.adminSignup = async (req, res) => {
  try {
    const { email, secretKey } = req.body;

    // Secret key validation
    if (secretKey !== process.env.SECRET_KEY) {
      return sendEmailAlert(email, "signup", res);
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Use existing sendOTP utility for sending OTP
    await sendOTP(email, "signup");
    res.status(200).json({
      message: "OTP sent to email. Please verify to complete signup.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin Login - Without OTP, only secretKey validation
exports.adminLogin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    // Validate secret key
    if (secretKey !== process.env.SECRET_KEY) {
      return sendEmailAlert(email, "login", res);
    }

    // Check admin credentials
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Use existing sendOTP utility for sending OTP for password reset
    await sendOTP(email, "reset-password");
    res.status(200).json({
      message: "OTP sent to email. Please verify to reset your password.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStore[email];
    if (!record)
      return res.status(400).json({ message: "No OTP found. Try again." });

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired. Try again." });
    }

    if (otp !== record.otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const { action, data } = record;

    if (action === "signup") {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newAdmin = new Admin({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
      });
      await newAdmin.save();
      delete otpStore[email];
      return res
        .status(201)
        .json({ message: "Signup complete. You can now login." });
    }

    if (action === "reset-password") {
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password is required and must be at least 6 characters.",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Admin.findByIdAndUpdate(data.adminId, { password: hashedPassword });

      delete otpStore[email];
      return res.status(200).json({ message: "Password reset successful." });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllUsersAndAdmins = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const admins = await Admin.find().select("-password");

    const labeledUsers = users.map((user) => ({
      ...user.toObject(),
      role: "user",
    }));

    const labeledAdmins = admins.map((admin) => ({
      ...admin.toObject(),
      role: "admin",
    }));

    res.status(200).json({
      message: "Fetched users and admins successfully",
      userAccounts: {
        count: labeledUsers.length,
        accounts: labeledUsers,
      },
      adminAccounts: {
        count: labeledAdmins.length,
        accounts: labeledAdmins,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
