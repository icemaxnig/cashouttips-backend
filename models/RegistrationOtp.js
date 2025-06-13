
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  expiresAt: Date,
});

module.exports = mongoose.model("RegistrationOtp", otpSchema);
