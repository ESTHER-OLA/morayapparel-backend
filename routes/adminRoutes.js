const express = require("express");
const {
  adminSignup,
  adminLogin,
  requestPasswordReset,
  getAllUsersAndAdmins,
  approveAdminRequest,
  getApprovalStatus,
  rejectAdminRequest,
} = require("../controllers/adminController");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

router.get("/dashboard", adminAuth, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard" });
});

router.post("/signup", adminSignup); // Admin signup
router.post("/login", adminLogin); // Admin login
// router.post("/verify-otp", verifyOTP);
router.post("/request-password-reset", requestPasswordReset);
// Get all users and admins (Accessible only by admin)
router.get("/get-all-accounts", adminAuth, getAllUsersAndAdmins);

// 🔥 New routes for email approval
router.get("/approve-request", approveAdminRequest);
router.get("/reject-request", rejectAdminRequest);
router.get("/approval-status", getApprovalStatus); // Optional: check approval state

module.exports = router;
