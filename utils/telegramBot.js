const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN";
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "@yourchannel"; // e.g. @cashouttips_ai

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

const sendTipToTelegram = async (tip) => {
  const message = `🔥 *New Booking Tip Uploaded!*

🏷️ *Title:* ${tip.title}
🎯 *Odds:* ${tip.odds}
💼 *Booking Code:* ${tip.bookingCode}
📅 *Date:* ${new Date(tip.date).toLocaleDateString()}

👀 Visit dashboard to unlock more tips.
`;

  try {
    await bot.sendMessage(TELEGRAM_CHANNEL_ID, message, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Telegram message error:", err.message);
  }
};

module.exports = {
  sendTipToTelegram,
};
