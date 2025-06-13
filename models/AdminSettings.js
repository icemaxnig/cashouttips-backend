
const mongoose = require("mongoose");

const AdminSettingsSchema = new mongoose.Schema({
  referralPercent: { type: Number, default: 5 },
  minWithdrawal: { type: Number, default: 1000 },
  depositInfo: { type: String, default: "" },

  // Payment gateway keys
  paystackPublic: String,
  paystackSecret: String,
  flutterwavePublic: String,
  flutterwaveSecret: String,
  fincraPublic: String,
  fincraSecret: String,
  cryptoPublic: String,
  cryptoSecret: String,

  // Live chat and support
  tawkId: String,
  whatsappLink: String,
  telegramSupport: String,

  // Gmail login
  enableGmailLogin: { type: Boolean, default: false },
  gmailClientId: String,
  gmailClientSecret: String,

  // Telegram login
  enableTelegramLogin: { type: Boolean, default: false },
  telegramBotUsername: String,
  telegramBotToken: String,

  // Turnstile
  cfTurnstile: String,
  cfTurnstileSecret: String
}, { timestamps: true });

module.exports = mongoose.model("AdminSettings", AdminSettingsSchema);
