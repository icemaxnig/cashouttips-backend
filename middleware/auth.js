const express = require("express");
const router = express.Router();

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

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/admin/login", loginLimiter, login);

router.post("/send-otp", otpRateLimiter, sendOtp);
router.post("/forgot-password", otpRateLimiter, forgotPassword);

router.post("/reset-password", resetPassword);
router.post("/reset-password-with-otp", resetPassword);
router.post("/verify-otp", verifyOtp);

module.exports = router;
