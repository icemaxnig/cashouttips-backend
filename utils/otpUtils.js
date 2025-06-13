const OTP = require("../models/RegisterOtp");

exports.generateAndStoreOtp = async (email) => {
  const existing = await OTP.findOne({ email });

  // Check cooldown (60 seconds)
  if (existing) {
    const diff = Date.now() - new Date(existing.createdAt).getTime();
    if (diff < 60 * 1000) {
      throw new Error("OTP recently sent. Please wait before retrying.");
    }
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.findOneAndUpdate(
    { email },
    { email, otp: otpCode, createdAt: Date.now() },
    { upsert: true }
  );

  return otpCode;
};
