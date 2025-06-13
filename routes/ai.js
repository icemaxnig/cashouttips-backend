const express = require('express');
const router = express.Router();

const cashbrainAnswers = {
  "what is cashouttips": "CashoutTips is a smart football prediction platform that offers daily tips, rollover plans, and premium booking codes powered by AI.",
  "how do i subscribe": "To subscribe, use the /subscribe command and choose your plan (1.5, 2.0, or 3.0 odds for 3/5/7 days).",
  "how does rollover work": "Rollover plans provide a new tip each day. Your plan type and duration determine the tip shown under /rollover.",
  "what is rollover": "Rollover is a progressive betting plan. You get a daily combo tip for 3, 5, or 7 days depending on your subscription.",
  "how do i buy booking codes": "Use the /buycodes command. Each code shows its odds, urgency, expiry, and price.",
  "what are cot coins": "COT Coins are rewards earned from playing games. They can unlock tips or enter jackpots.",
  "how to play games": "Use /playgame to start. You can retry with /retry and track your history with /mygames.",
  "how to withdraw": "Withdrawals are requested via /withdraw. Only bonus wallet funds are withdrawable (min ₦1000).",
  "how does referral work": "Use /referral to get your link. You'll earn bonus coins or cash when your friends join.",
  "how to deposit": "Use /deposit to fund your main wallet. This can be used for tips, bookings, or plan purchases.",
  "how to check my wallet": "Use /wallet to view your Main and Bonus wallet balances.",
  "is cashouttips free": "CashoutTips offers free daily tips via /today. Premium tips and rollovers require subscription.",
  "how to contact support": "Send your question through /askcashbrain or reach admin via the contact link in the web app."
};

router.post('/ask', async (req, res) => {
  const question = req.body.question?.toLowerCase().trim();

  for (const key in cashbrainAnswers) {
    if (question.includes(key)) {
      return res.json({ answer: `🤖 Cashbrain says: ${cashbrainAnswers[key]}` });
    }
  }

  return res.json({
    answer: "🤖 Cashbrain says: I'm trained only on the CashoutTips platform. Ask me about rollover, booking codes, subscriptions, coins, withdrawals, or how to use the app."
  });
});

module.exports = router;
