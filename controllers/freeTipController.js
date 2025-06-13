const FreeTip = require("../models/FreeTip");
const axios = require("axios");

exports.createFreeTip = async (req, res) => {
  const { match, odds, prediction } = req.body;
  const newTip = await FreeTip.create({ match, odds, prediction });

  // Post to Telegram
  await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    chat_id: "@cashouttips_ai",
    text: `🔥 *Free Tip!*\n🏟 ${match}\n📊 Odds: ${odds}\n🧠 Tip: ${prediction}`,
    parse_mode: "Markdown"
  });

  res.status(201).json(newTip);
};

exports.getFreeTipPreview = async (req, res) => {
  const tips = await FreeTip.find().sort({ createdAt: -1 }).limit(3);
  res.json(tips.map(t => ({
    match: t.match,
    odds: t.odds,
    prediction: "🔒 Hidden",
    link: "https://t.me/cashouttips_ai"
  })));
};
