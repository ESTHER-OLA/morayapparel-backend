// authRoutes.js
const express = require("express");
const passport = require("../config/passport");
const { authMiddlewares } = require("../middlewares/authMiddlewares");
const {
  googleSignup,
  googleSignupCallback,
  googleLogin,
  googleLoginCallback,
} = require("../middlewares/googleAuth");
const {
  signup,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  saveProfile,
  updateProfile,
  setNewPasswordForGoogleUser,
  otpVerification,
} = require("../controllers/userController");
const { deleteAccount } = require("../controllers/accountController");
require("dotenv").config();

const router = express.Router();

// Initialize passport middleware
router.use(passport.initialize());

// Google OAuth endpoints for Signup
router.get("/google/signup", googleSignup);
router.get("/google/signup/callback", googleSignupCallback);

// Google OAuth endpoints for Login
router.get("/google/login", googleLogin);
router.get("/google/login/callback", googleLoginCallback);

// Standard authentication endpoints
router.post("/signup", signup);
router.post("/verify-otp", otpVerification);
router.post("/login", login);

//reset password
router.post("/set-new-password", setNewPasswordForGoogleUser);
router.post("/password-reset-request", requestPasswordReset);
router.post("/reset-password", resetPassword);

router.post("/profile", authMiddlewares, saveProfile); // Save profile details
router.get("/profile", authMiddlewares, getProfile); // Get user profile
router.put("/profile", authMiddlewares, updateProfile); // Update profile details

router.delete("/delete-account", deleteAccount); //delete account user & admin account

module.exports = router;
