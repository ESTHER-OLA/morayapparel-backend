const bcrypt = require("bcryptjs");
const transporter = require("../config/transporter");
const User = require("../models/User");

const sendOTP = async (email, purpose) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await User.findOneAndUpdate(
      { email },
      {
        otpCode: hashedOTP,
        otpExpires: Date.now() + 10 * 60 * 1000,
        otpPurpose: purpose,
      }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your ${
        purpose === "signup" ? "Signup" : "Password Reset"
      } OTP Code`,
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });
  } catch (error) {
    console.error("Error sending OTP:", error); // Log the error
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOTP;
