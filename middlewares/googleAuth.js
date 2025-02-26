// middlewares/googleAuth.js
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to initiate Google OAuth for Signup
exports.googleSignup = passport.authenticate("google-signup", {
  scope: ["profile", "email"],
});

// Middleware to handle Google OAuth callback for Signup
exports.googleSignupCallback = (req, res, next) => {
  passport.authenticate("google-signup", { session: false }, (err, user) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: "Google signup failed" });
    }
    // Generate a JWT for the new user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  })(req, res, next);
};

// Middleware to initiate Google OAuth for Login
exports.googleLogin = passport.authenticate("google-login", {
  scope: ["profile", "email"],
});

// Middleware to handle Google OAuth callback for Login
exports.googleLoginCallback = (req, res, next) => {
  passport.authenticate("google-login", { session: false }, (err, user) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: "Google login failed" });
    }
    // Generate a JWT for the authenticated user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  })(req, res, next);
};
