// 📁 controllers/adminRolloverTipController.js

const RolloverTip = require("../../models/RolloverTip");
const RolloverPlan = require("../../models/RolloverPlan");
const logActivity = require("../../utils/logActivity");

// ✅ Upload a new Rollover Tip
exports.uploadTip = async (req, res) => {
  try {
    const { planId, dayIndex, games, totalOdds, note, expiresAt } = req.body;

    if (!planId || !dayIndex || !games || !totalOdds || !expiresAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

    // Validate plan
    const plan = await RolloverPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Invalid plan selected" });

    // ✅ Restrict one tip per plan per day
    const existing = await RolloverTip.findOne({
      plan: planId,
      dayIndex: parseInt(dayIndex)
    });

    if (existing) {
      return res.status(400).json({ message: `Tip already exists for plan ${planId} on day ${dayIndex}` });
    }

    // ✅ Create tip
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
      expiresAt: new Date(expiresAt)
    });

    await tip.save();
    await logActivity({ userId: req.user._id, type: "CreateRolloverTip", description: `Uploaded tip for plan ${planId} day ${dayIndex}` });
    res.status(201).json({ message: "Rollover tip uploaded successfully", tip });
  } catch (err) {
    console.error("❌ Failed to upload tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all tips (admin view)
exports.getAllTips = async (req, res) => {
  try {
    const tips = await RolloverTip.find().populate("plan", "name odds duration").sort({ createdAt: -1 });
    res.json(tips);
  } catch (err) {
    console.error("❌ Failed to fetch tips:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update a tip
exports.updateTip = async (req, res) => {
  try {
    const tipId = req.params.id;
    const { dayIndex, games, totalOdds, note, expiresAt } = req.body;

    // Validate games structure if provided
    if (games && Array.isArray(games)) {
      for (let i = 0; i < games.length; i++) {
        const game = games[i];
        if (!game.league || !game.kickoff || !game.odds || !game.bookmaker || !game.bookingCode) {
          return res.status(400).json({ 
            message: `Game ${i + 1} is missing required fields: league, kickoff, odds, bookmaker, bookingCode` 
          });
        }
      }
    }

    const updateData = {};
    if (dayIndex !== undefined) updateData.dayIndex = parseInt(dayIndex);
    if (games) {
      updateData.games = games.map(game => ({
        league: game.league,
        teams: game.teams || `${game.teamA} vs ${game.teamB}`,
        teamA: game.teamA,
        teamB: game.teamB,
        kickoff: game.kickoff,
        odds: game.odds,
        bookmaker: game.bookmaker,
        bookingCode: game.bookingCode,
        prediction: game.prediction || "Home Win"
      }));
    }
    if (totalOdds !== undefined) updateData.totalOdds = parseFloat(totalOdds);
    if (note !== undefined) updateData.note = note;
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);

    const updated = await RolloverTip.findByIdAndUpdate(
      tipId,
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Tip not found" });

    await logActivity({ userId: req.user._id, type: "UpdateRolloverTip", description: `Updated tip ${tipId}` });
    res.json({ message: "Rollover tip updated", tip: updated });
  } catch (err) {
    console.error("❌ Failed to update tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a tip
exports.deleteTip = async (req, res) => {
  try {
    const tipId = req.params.id;
    const deleted = await RolloverTip.findByIdAndDelete(tipId);
    if (!deleted) return res.status(404).json({ message: "Tip not found" });
    await logActivity({ userId: req.user._id, type: "DeleteRolloverTip", description: `Deleted tip ${tipId}` });
    res.json({ message: "Rollover tip deleted" });
  } catch (err) {
    console.error("❌ Failed to delete tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

