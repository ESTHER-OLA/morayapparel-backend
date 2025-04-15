const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOTP");
const transporter = require("../config/transporter");
// const Otp = require("../models/Otp");
const PendingApproval = require("../models/PendingApproval");
require("dotenv").config();

// Function to send email alerts
const sendEmailAlert = async (email, action, res) => {
  const mailOptions = {
    from: process.env.BUSINESS_SUPPORT_EMAIL,
    to: process.env.BUSINESS_SUPPORT_EMAIL, // Send to business support
    subject: "Admin Secret Key Validation Request",
    html: `
    <p>An admin with email <strong>${email}</strong> is attempting to <strong>${action}</strong>.</p>
    <p>If this is authorized, please click:</p>
    <a href="${process.env.FRONTEND_URL}/api/admin/approve-request?email=${email}" style="padding: 10px 15px; background-color: green; color: white; text-decoration: none;">APPROVE</a>
    <a href="${process.env.FRONTEND_URL}/api/admin/reject-request?email=${email}" style="padding: 10px 15px; background-color: red; color: white; text-decoration: none; margin-left: 10px;">REJECT</a>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Save pending approval
    await PendingApproval.findOneAndUpdate(
      { email },
      { email, action, status: "pending" },
      { upsert: true, new: true }
    );

    res.status(401).json({
      message: "Secret key validation pending. Await business approval.",
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

    // Check if the admin is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Secret key validation
    if (secretKey !== process.env.SECRET_KEY) {
      return sendEmailAlert(email, "signup", res);
    }

    // Check approval status in PendingApproval
    const approval = await PendingApproval.findOne({ email });

    if (!approval || approval.status === "pending") {
      return res.status(403).json({
        message: "Signup request is pending approval. Please wait.",
      });
    }

    if (approval.status === "rejected") {
      return res.status(403).json({
        message: "Signup request was rejected. Contact support if needed.",
      });
    }

    if (approval.status !== "approved") {
      return res.status(403).json({
        message: "Signup not allowed. Approval required.",
      });
    }

    // Send OTP and store data
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

// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

//     if (!otpRecord)
//       return res.status(400).json({ message: "No OTP found. Try again." });

//     if (new Date() > otpRecord.expiresAt) {
//       await Otp.deleteOne({ _id: otpRecord._id });
//       return res.status(400).json({ message: "OTP expired. Try again." });
//     }

//     const isMatch = await bcrypt.compare(otp, otpRecord.otp);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid OTP." });

//     // Handle signup
//     if (otpRecord.purpose === "signup") {
//       const { firstName, lastName, password } = otpRecord.signupData || {};

//       if (!otpRecord.isAdmin) {
//         // For users
//         const existingUser = await User.findOne({ email });
//         if (existingUser)
//           return res.status(400).json({ message: "User already exists." });

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({
//           firstName,
//           lastName,
//           email,
//           password: hashedPassword,
//         });
//         await newUser.save();
//       } else {
//         // For admins
//         const existingAdmin = await Admin.findOne({ email });
//         if (existingAdmin)
//           return res.status(400).json({ message: "Admin already exists." });

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newAdmin = new Admin({
//           firstName,
//           lastName,
//           email,
//           password: hashedPassword,
//         });
//         await newAdmin.save();
//       }

//       await Otp.deleteOne({ _id: otpRecord._id });

//       return res.status(201).json({
//         message: "Signup complete. You can now login.",
//       });
//     }

//     // Handle password reset
//     if (otpRecord.purpose === "reset-password") {
//       if (!newPassword || newPassword.length < 6) {
//         return res.status(400).json({
//           message: "New password is required and must be at least 6 characters.",
//         });
//       }

//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       if (otpRecord.isAdmin) {
//         await Admin.findOneAndUpdate({ email }, { password: hashedPassword });
//       } else {
//         await User.findOneAndUpdate({ email }, { password: hashedPassword });
//       }

//       await Otp.deleteOne({ _id: otpRecord._id });

//       return res.status(200).json({ message: "Password reset successful." });
//     }

//     res.status(400).json({ message: "Invalid action." });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

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
    const { email } = req.body;

    const approval = await PendingApproval.findOneAndUpdate(
      { email },
      { status: "approved" },
      { new: true }
    );

    if (!approval) {
      return res.status(404).json({ message: "Pending request not found" });
    }

    res.status(200).json({ message: "Admin request approved successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
