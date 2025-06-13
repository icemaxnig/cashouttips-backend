const rateLimit = require("express-rate-limit");

// 🔐 Login attempts – 5 per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🧾 Registration attempts – 5 per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Too many registrations. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔁 OTP request attempts – 5 per 15 minutes
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many OTP requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Export all limiters
module.exports = {
  loginLimiter,
  registerLimiter,
  otpRateLimiter,
};
