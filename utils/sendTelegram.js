const axios = require("axios");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL = "@cashouttips_ai";

const sendTelegram = async (text) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHANNEL,
    text,
    parse_mode: "Markdown",
  });
};

module.exports = sendTelegram;
