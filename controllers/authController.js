// 📁 controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RegisterOtp = require("../models/RegisterOtp");
const UserLog = require("../models/UserLog");
const sendOtpEmail = require("../sendOtpEmail");
const generateAndStoreOtp = require("../utils/generateAndStoreOtp");

// 🔐 User Registration
exports.register = async (req, res) => {
  const { email, password, firstName = "User" } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      firstName,
      mainWallet: 0,
      bonusWallet: 0,
    });

    // 🚀 Generate and send OTP
    const otp = await generateAndStoreOtp(email);
    const sent = await sendOtpEmail(email, firstName, otp);
    if (!sent) {
      return res.status(500).json({ message: "User created but OTP failed to send" });
    }

    return res.status(201).json({ message: "User registered. OTP sent.", userId: user._id });
  } catch (err) {
    console.error("Registration error:", err.message);
    return res.status(500).json({ message: "Failed to register" });
  }
};


// 🔐 Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🔐 Set cookie for backend sessions (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Failed to login" });
  }
};


// ✉️ OTP Email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    await sendOtpEmail(email);
    return res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error("OTP send error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// 🛠 Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = await generateAndStoreOtp(email);
    const sent = await sendOtpEmail(email, user.firstName || "User", otp);
    if (!sent) throw new Error("OTP send failed");

    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

// 🔄 Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ success: false, message: "Missing fields" });

  try {
    const record = await RegisterOtp.findOne({ email });
    if (!record || record.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate({ email }, { password: hashed });

    await RegisterOtp.deleteOne({ email });

    if (user) {
      await UserLog.create({
        userId: user._id,
        email,
        action: "reset-password",
        ip: req.ip,
        userAgent: req.headers["user-agent"]
      });
    }

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// 🔁 Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err.message);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

// ✅ OTP Verification
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const record = await RegisterOtp.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// 🗑️ Admin - Get Deleted Users
exports.getDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await User.find({ isDeleted: true });
    res.status(200).json(deletedUsers);
  } catch (err) {
    console.error("Failed to fetch deleted users:", err.message);
    res.status(500).json({ message: "Failed to fetch deleted users" });
  }
};

// ♻️ Admin - Restore Deleted User
exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User restored", user });
  } catch (err) {
    console.error("Restore user error:", err.message);
    res.status(500).json({ message: "Failed to restore user" });
  }
};

// 💀 Admin - Permanently Delete User
exports.permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User permanently deleted" });
  } catch (err) {
    console.error("Permanent delete error:", err.message);
    res.status(500).json({ message: "Failed to permanently delete user" });
  }
};
