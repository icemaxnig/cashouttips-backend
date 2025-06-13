const mongoose = require("mongoose");

const registerOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires after 5 minutes
  },
});

// ✅ Prevent OverwriteModelError if model is already compiled
module.exports = mongoose.models.RegisterOtp || mongoose.model("RegisterOtp", registerOtpSchema);
