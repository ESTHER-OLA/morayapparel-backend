const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOTP");
const transporter = require("../config/transporter");
// const Otp = require("../models/Otp");
const PendingApproval = require("../models/PendingApproval");
require("dotenv").config();

// Function to send email alerts
const sendEmailAlert = async (email, action, res, signupData) => {
  const mailOptions = {
    from: process.env.BUSINESS_SUPPORT_EMAIL,
    to: process.env.BUSINESS_SUPPORT_EMAIL, // Send to business support
    subject: "Admin Secret Key Validation Request",
    html: `
    <p>An admin with email <strong>${email}</strong> is attempting to <strong>${action}</strong>.</p>
    <p>If this is authorized, please click:</p>
    <a href="${process.env.CLIENT_URL}/api/admin/approve-request?email=${email}" style="padding: 10px 15px; background-color: green; color: white; text-decoration: none;">APPROVE</a>
    <a href="${process.env.CLIENT_URL}/api/admin/reject-request?email=${email}" style="padding: 10px 15px; background-color: red; color: white; text-decoration: none; margin-left: 10px;">REJECT</a>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);

      // Only save pending approval if signupData exists
      if (signupData) {
        await PendingApproval.findOneAndUpdate(
          { email },
          { email, action, status: "pending", signupData },
          { upsert: true, new: true }
        );
      }

    res.status(201).json({
      message: "Secret key validation pending. Await business approval.",
      pendingApproval: true,
    });
  } catch (error) {
    console.error("Email alert error:", error);
    res.status(500).json({
      message: "Failed to send email alert",
      error: error?.message || error.toString(),
    });
  }
};

// Admin Signup - Step 1: Validate and send OTP
exports.adminSignup = async (req, res) => {
  try {
    const { email, secretKey, firstName, lastName, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Check for approval record
    const approval = await PendingApproval.findOne({ email });

    // CASE 1: No approval yet and invalid secret key
    if (!approval && secretKey !== process.env.SECRET_KEY) {
      await sendEmailAlert(email, "signup", res, {
        firstName,
        lastName,
        email,
        password,
      });
      return; // stop here after sending alert
    }

    // CASE 2: If approval exists and status is pending
    if (approval && approval.status === "pending") {
      return res.status(200).json({
        message: "Signup request is pending approval. Please wait.",
        pendingApproval: true,
      });
    }

    // CASE 3: If approval exists and status is rejected
    if (approval && approval.status === "rejected") {
      return res.status(403).json({
        message: "Signup request was rejected. Contact support if needed.",
      });
    }

    // CASE 4: Not approved yet
    if (approval && approval.status !== "approved") {
      return res.status(403).json({
        message: "Signup not allowed. Approval required.",
      });
    }

    // If secretKey is still wrong at this point, prevent further
    if (secretKey !== process.env.SECRET_KEY) {
      return res.status(403).json({
        message: "Invalid secret key.",
      });
    }

    // At this point everything is valid, proceed to send OTP
    await sendOTP(email, "signup", {
      firstName,
      lastName,
      email,
      password,
      isAdmin: true,
    });

    res.status(200).json({
      message: "OTP sent to email. Please verify to complete signup.",
    });
  } catch (error) {
    console.error("Signup error:", error);
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

exports.approveAdminRequest = async (req, res) => {
  try {
    const { email } = req.query;

    const approval = await PendingApproval.findOne({ email });

    if (!approval || approval.status !== "pending") {
      return res
        .status(404)
        .send(`<h3>No pending approval found for ${email}</h3>`);
    }

    // Update the status to approved
    approval.status = "approved";
    await approval.save();

    const { signupData } = approval;

    if (signupData) {
      await sendOTP(email, "signup", {
        ...signupData,
        isAdmin: true,
      });
    }

    res
      .status(200)
      .send(`<h3>Admin request for ${email} approved successfully.</h3>`);
  } catch (error) {
    res.status(500).send(`<h3>Server error: ${error.message}</h3>`);
  }
};

exports.getApprovalStatus = async (req, res) => {
  try {
    const { email } = req.query;

    const approval = await PendingApproval.findOne({ email });

    if (!approval) {
      return res.status(404).json({ message: "No approval found" });
    }

    res.status(200).json({ status: approval.status });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.rejectAdminRequest = async (req, res) => {
  try {
    const { email } = req.query;

    const rejection = await PendingApproval.findOneAndUpdate(
      { email },
      { status: "rejected" },
      { new: true }
    );

    if (!rejection) {
      return res.status(404).json({ message: "Pending request not found" });
    }

    res.status(200).json({ message: "Admin request rejected successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
