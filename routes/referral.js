const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendError = require("../utils/sendError");

router.get("/summary", async (req, res) => {
  const { telegramId } = req.query;
  if (!telegramId) return sendError(res, 400, "telegramId is required");

  const user = await User.findOne({ telegramId });
  if (!user) return sendError(res, 404, "User not found");

  const referredUsers = await User.find({ referredBy: user.refCode });
  const totalEarnings = referredUsers.length * 100; // Adjust based on your reward system

  res.json({
    refCode: user.refCode,
    count: referredUsers.length,
    totalEarnings,
  });
});

module.exports = router;
