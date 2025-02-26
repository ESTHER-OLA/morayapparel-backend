// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

// Google Signup Strategy
passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/signup/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { displayName, emails } = profile;
        const email = emails[0].value;
        let user = await User.findOne({ email });
        if (user) {
          // User exists; instruct to login instead.
          return done(new Error("User already exists. Please login instead."), null);
        } else {
          // Create new user with a dummy password
          const dummyPassword = email + process.env.JWT_SECRET;
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(dummyPassword, salt);
          user = new User({ name: displayName, email, password: hashedPassword });
          await user.save();
          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Google Login Strategy
passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/login/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { emails } = profile;
        const email = emails[0].value;
        let user = await User.findOne({ email });
        if (!user) {
          // User doesn't exist; instruct to signup first.
          return done(new Error("User does not exist. Please sign up first."), null);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
