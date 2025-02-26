// authRoutes.js
const express = require("express");
const passport = require("../config/passport");
const authMiddleware = require("../middlewares/authMiddlewares");
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
  getProfile,
  updateProfile,
} = require("../controllers/userController");
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
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

//reset password
router.post("/set-new-password", setNewPasswordForGoogleUser);
router.post("/password-reset-request", requestPasswordReset);
router.post("/reset-password", resetPassword);

router.post("/profile", authMiddleware, saveProfile); // Save profile details
router.get("/profile", authMiddleware, getProfile); // Get user profile
router.put("/profile", authMiddleware, updateProfile); // Update profile details

module.exports = router;
