// controllers/rolloverAccessController.js

const UserRollover = require("../models/UserRollover");
const RolloverPlan = require("../models/RolloverPlan");
const RolloverGame = require("../models/RolloverGame");

exports.getActiveRolloverForUser = async (req, res) => {
  try {
    const telegramId = req.query.telegramId;
    if (!telegramId) return res.status(400).json({ message: "telegramId is required" });

    // Step 1: Get user's rollover subscription
    const userRollover = await UserRollover.findOne({ userId: telegramId }).populate("planId");
    if (!userRollover) return res.status(404).json({ message: "No active rollover plan found" });

    // Step 2: Check if a game exists for that plan and is not expired
    const game = await RolloverGame.findOne({
      planId: userRollover.planId._id,
      expiresAt: { $gt: new Date() }
    });

    if (!game) return res.status(404).json({ message: "No active game for your plan" });

    // Step 3: Calculate how many days since user started
    const start = new Date(userRollover.startDate);
    const now = new Date();
    const daysElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

    res.json({
      planType: userRollover.planId.name,
      currentDay: daysElapsed,
      totalDays: userRollover.planId.duration,
      totalOdds: game.totalOdds,
      bookingCode: game.bookingCode,
      games: game.games
    });

  } catch (err) {
    console.error("❌ Error in rollover flex-active:", err);
    res.status(500).json({ message: "Server error" });
  }
};
