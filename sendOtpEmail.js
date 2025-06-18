// sendOtpEmail.js
const nodemailer = require("nodemailer");

// Load environment variables
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Sends a beautifully branded OTP email
 * @param {string} email - recipient's email
 * @param {string} name - user's name
 * @param {string} otp - one-time password
 * @returns {Promise<boolean>} true if sent successfully, false otherwise
 */
const sendOtpEmail = async (email, name, otp) => {
  if (!email || !name || !otp) {
    console.error("Missing email, name or OTP");
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0A0E2C; padding: 20px; color: #ffffff;">
      <div style="max-width: 500px; margin: auto; background: #111436; padding: 30px; border-radius: 12px;">
        <div style="text-align: center;">
          <img src="https://cashouttips.com/logo.png" alt="CashoutTips Logo" style="height: 60px;" />
          <h2 style="color: #FFCC00; margin-top: 20px;">Your OTP Code</h2>
        </div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Use the OTP below to continue your request:</p>
        <div style="font-size: 28px; font-weight: bold; background: #FFCC00; color: #0A0E2C; text-align: center; padding: 12px; margin: 20px 0; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #cccccc;">This code will expire in 10 minutes. Do not share it.</p>
        <p style="margin-top: 30px; font-size: 13px; color: #888888;">
          ⚽ Powered by smart AI predictions.<br/>
          Visit <a href="https://cashouttips.com" style="color: #FFCC00;">cashouttips.com</a>
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: "CashoutTips <cashout@cashouttips.com>",
    to: email,
    subject: "Your OTP Code - CashoutTips",
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error.message);
    return false;
  }
};

module.exports = sendOtpEmail;
