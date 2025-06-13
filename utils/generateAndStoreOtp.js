// 📁 utils/generateAndStoreOtp.js
const RegisterOtp = require("../models/RegisterOtp");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 🔐 6-digit OTP
};

const generateAndStoreOtp = async (email) => {
  const otp = generateOtp();
  await RegisterOtp.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true }
  );
  return otp;
};

module.exports = generateAndStoreOtp;
