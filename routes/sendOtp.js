// routes/sendOtp.js
const express = require("express");
const router = express.Router();
const sendOtpEmail = require("../sendOtpEmail");

// POST /api/send-otp
router.post("/", async (req, res) => {
  const { email, name, otp } = req.body;

  // Simple validation
  if (!email || !name || !otp) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Send the OTP
  const sent = await sendOtpEmail(email, name, otp);

  if (sent) {
    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } else {
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

module.exports = router;
