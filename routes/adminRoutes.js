const express = require("express");
const { adminSignup, adminLogin } = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get("/dashboard", adminAuth, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard" });
});

router.post("/signup", adminSignup); // Admin signup
router.post("/login", adminLogin); // Admin login

module.exports = router;
