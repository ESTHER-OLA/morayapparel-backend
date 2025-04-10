const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

exports.deleteAccount = async (req, res) => {
  try {
    const { userfirstName, userlastName, userId, password } = req.body;

    // Try to find user first
    let account = await User.findOne({
      _id: userId,
      firstName: userfirstName,
      lastName: userlastName,
    });
    let role = "user";

    if (!account) {
      // If not a user, check for admin
      account = await Admin.findOne({
        _id: userId,
        firstName: userfirstName,
        lastName: userlastName,
      });
      role = "admin";
    }

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Delete the account
    if (role === "user") {
      await User.findByIdAndDelete(account._id);
    } else {
      await Admin.findByIdAndDelete(account._id);
    }

    res.status(200).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } account deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
