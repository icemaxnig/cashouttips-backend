
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/summary", async (req, res) => {
  const { telegramId } = req.query;
  if (!telegramId) return res.status(400).json({ message: "telegramId is required" });

  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ message: "User not found" });

  const referredUsers = await User.find({ referredBy: user.refCode });
  const totalEarnings = referredUsers.length * 100; // Adjust based on your reward system

  res.json({
    refCode: user.refCode,
    count: referredUsers.length,
    totalEarnings,
  });
});

module.exports = router;
