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


// GET /rollover/my — returns user's active rollover plans and daily tips
exports.getUserRolloverTips = async (req, res) => {
  try {
    const userId = req.user.userId;

    const subs = await UserRollover.find({ userId }).populate("planId");
    const plans = await RolloverGame.find({ expiresAt: { $gt: new Date() } }).populate("planId").sort({ createdAt: 1 });

    const result = subs.map(sub => {
      const planTips = plans.filter(p => String(p.planId._id) === String(sub.planId._id));
      const currentDayIndex = Math.min(planTips.length - 1, sub.currentDayIndex || 0);
      return {
        planId: sub.planId._id,
        planName: sub.planId.name,
        duration: sub.planId.duration,
        currentDayIndex,
        tips: planTips.map(t => ({
          _id: t._id,
          totalOdds: t.totalOdds,
          expiresAt: t.expiresAt,
          note: t.note,
          games: t.games.map(g => ({
            teamA: g.teamA,
            teamB: g.teamB,
            kickoff: g.kickoff,
            league: g.league,
            odds: g.odds,
            prediction: g.prediction
          }))
        }))
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Failed to fetch user's rollover tips:", err);
    res.status(500).json({ message: "Error loading rollover tips" });
  }
};

// GET /rollover/all — returns all tips grouped by plan
exports.getAllRolloverTips = async (req, res) => {
  try {
    const tips = await RolloverGame.find({ expiresAt: { $gt: new Date() } }).populate("planId").sort({ createdAt: -1 });

    const grouped = {};

    tips.forEach(tip => {
      const pid = String(tip.planId._id);
      if (!grouped[pid]) {
        grouped[pid] = {
          planId: pid,
          planName: tip.planId.name,
          totalOdds: tip.totalOdds,
          duration: tip.planId.duration,
          tips: []
        };
      }
      grouped[pid].tips.push({
        _id: tip._id,
        expiresAt: tip.expiresAt,
        note: tip.note,
        games: tip.games.map(g => ({
          teamA: g.teamA,
          teamB: g.teamB,
          kickoff: g.kickoff,
          league: g.league,
          odds: g.odds,
          prediction: g.prediction
        }))
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("❌ Failed to fetch all rollover tips:", err);
    res.status(500).json({ message: "Error loading rollover tips" });
  }
};