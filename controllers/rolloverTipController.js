// controllers/rolloverTipsController.js
const RolloverTip = require("../models/RolloverTip");
const RolloverPlan = require("../models/RolloverPlan");

// ✅ Upload daily tip for a plan
exports.uploadRolloverTip = async (req, res) => {
  const { planId, dayIndex, games, totalOdds, note, expiresAt } = req.body;

  if (!planId || !dayIndex || !games?.length || !totalOdds || !expiresAt) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Validate games structure
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (!game.league || !game.kickoff || !game.odds || !game.bookmaker || !game.bookingCode) {
        return res.status(400).json({ 
          message: `Game ${i + 1} is missing required fields: league, kickoff, odds, bookmaker, bookingCode` 
        });
      }
      
      // Ensure teams field is present (either teams or teamA+teamB)
      if (!game.teams && (!game.teamA || !game.teamB)) {
        return res.status(400).json({ 
          message: `Game ${i + 1} must have either 'teams' field or both 'teamA' and 'teamB' fields` 
        });
      }
    }

    const plan = await RolloverPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // ✅ Limit: one tip per plan per day
    const existingTip = await RolloverTip.findOne({ plan: planId, dayIndex });
    if (existingTip) {
      return res.status(400).json({ message: `Tip already exists for Day ${dayIndex}` });
    }

    const tip = new RolloverTip({
      plan: planId,
      dayIndex: parseInt(dayIndex),
      games: games.map(game => ({
        league: game.league,
        teams: game.teams || `${game.teamA} vs ${game.teamB}`,
        teamA: game.teamA,
        teamB: game.teamB,
        kickoff: game.kickoff,
        odds: game.odds,
        bookmaker: game.bookmaker,
        bookingCode: game.bookingCode,
        prediction: game.prediction || "Home Win"
      })),
      totalOdds: parseFloat(totalOdds),
      note,
      expiresAt: new Date(expiresAt),
    });

    await tip.save();
    return res.status(201).json({ message: "Tip uploaded successfully", tip });
  } catch (err) {
    console.error("❌ Error uploading tip:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Public: fetch tips by plan and day (used in viewer)
exports.getTipForPlanDay = async (req, res) => {
  const { planId, dayIndex } = req.params;
  try {
    const tip = await RolloverTip.findOne({ plan: planId, dayIndex }).populate("plan");
    if (!tip) return res.status(404).json({ message: "No tip found" });
    return res.json(tip);
  } catch (err) {
    console.error("❌ Error fetching tip:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
