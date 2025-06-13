const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { changePassword } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

const {
  register,
  login,
  sendOtp,
  forgotPassword,
  resetPassword,
  verifyOtp,
  } = require("../controllers/authController");

const {
  loginLimiter,
  registerLimiter,
  otpRateLimiter
} = require("../middleware/rateLimiters");

const checkRole = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Core Auth
router.post("/login", loginLimiter, login);
router.post("/register", registerLimiter, register);
router.post("/forgot-password", otpRateLimiter, forgotPassword);
router.post("/reset-password", otpRateLimiter, resetPassword);
router.post("/verify-otp", otpRateLimiter, verifyOtp);
router.post("/change-password", verifyToken, changePassword);
router.post("/send-otp", otpRateLimiter,sendOtp); // 🔐 fixed line

// ✅ Telegram Auth
router.post("/telegram", async (req, res) => {
  const { telegramId, email, password } = req.body;
  if (!telegramId || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "telegramId, email, and password are required"
    });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      if (user.telegramId && user.telegramId !== telegramId) {
        return res.status(403).json({
          success: false,
          message: "Email already used by another Telegram account"
        });
      }
      user.telegramId = telegramId;
      user.password = await bcrypt.hash(password, 10);
      user.isNewUser = false;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Telegram account linked",
        userId: user._id
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
        telegramId,
        isNewUser: false
      });
      await newUser.save();
      return res.status(201).json({
        success: true,
        message: "User created and Telegram linked",
        userId: newUser._id
      });
    }
  } catch (error) {
    console.error("Telegram auth error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Telegram Link
router.post("/link-telegram", async (req, res) => {
  const { telegramId, token } = req.body;
  if (!telegramId || !token) {
    return res.status(400).json({
      success: false,
      message: "telegramId and token required"
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    if (user.telegramId && user.telegramId !== telegramId) {
      return res.status(403).json({
        success: false,
        message: "Telegram already linked to another user"
      });
    }
    user.telegramId = telegramId;
    user.isNewUser = false;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Telegram linked successfully"
    });
  } catch (err) {
    console.error("Link error:", err.message);
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
});

// ✅ JWT-Protected Endpoints
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("GET /auth/me error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/admin-only", verifyToken, checkRole("admin"), (req, res) => {
  return res.status(200).json({ success: true, message: "Welcome admin!" });
});

module.exports = router;
