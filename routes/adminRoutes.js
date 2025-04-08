const express = require("express");
const {
  adminSignup,
  adminLogin,
  requestPasswordReset,
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

module.exports = router;
