const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");

const MIN_WITHDRAW = 1000;

// POST /api/withdraw/request
router.post("/request", auth, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || isNaN(amount) || amount < MIN_WITHDRAW) {
    return res.status(400).json({ message: `Minimum withdrawal is ₦${MIN_WITHDRAW}` });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.bonusWallet < amount) {
      return res.status(400).json({ message: "Insufficient bonus wallet balance." });
    }

    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      status: "pending",
    });

    user.bonusWallet -= amount;
    await withdrawal.save();
    await user.save();

    res.status(201).json({ message: "Withdrawal request submitted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
