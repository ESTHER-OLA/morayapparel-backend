const bcrypt = require("bcryptjs");
const transporter = require("../config/transporter");
const Otp = require("../models/Otp");

const sendOTP = async (email, purpose, data = {}) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 mins

    const isAdmin = data.isAdmin || false;

    // Remove existing OTPs for this email, purpose, and admin status
    await Otp.deleteMany({ email, otpPurpose: purpose, isAdmin });

    // Construct signupData only for signup purposes
    const signupData =
      purpose === "signup"
        ? {
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
          }
        : undefined;

    const otpEntry = new Otp({
      email,
      otpCode: hashedOTP, // Corrected to match schema
      otpExpires, // Corrected to match schema
      otpPurpose: purpose, // Corrected to match schema
      isAdmin,
      firstName: signupData?.firstName, // Corrected for signup data
      lastName: signupData?.lastName, // Corrected for signup data
      password: signupData?.password, // Corrected for signup data
    });

    await otpEntry.save();

    const purposeText = purpose === "signup" ? "Signup" : "Password Reset";

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your ${isAdmin ? "Admin" : "User"} ${purposeText} OTP Code`,
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });

    console.log(
      `OTP sent to ${email} for ${purposeText} (${isAdmin ? "Admin" : "User"})`
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOTP;
