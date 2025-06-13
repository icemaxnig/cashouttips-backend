const RolloverTip = require("../models/RolloverTip");
const RolloverPlan = require("../models/RolloverPlan");

exports.createRolloverGame = async (req, res) => {
  try {
    let {
      plan,
      league,
      teamA,
      teamB,
      bookingCode,
      bookmaker,
      totalOdds,
      expiresAt,
      games = [],
    } = req.body;

    // 🔍 Log incoming data
    console.log("🟡 Incoming Rollover Tip:", {
      plan,
      league,
      teamA,
      teamB,
      bookingCode,
      bookmaker,
      totalOdds,
      expiresAt,
      games
    });

    // ✅ Infer from games[0] if needed
    if (games.length > 0) {
      const firstGame = games[0];
      if (!league && firstGame.league) league = firstGame.league;

      if ((!teamA || !teamB) && firstGame.teams?.includes(" vs ")) {
        const [a, b] = firstGame.teams.split(" vs ");
        if (!teamA) teamA = a?.trim();
        if (!teamB) teamB = b?.trim();
      }
    }

    // ✅ Final validation
    if (!plan || !league || !teamA || !teamB || !bookingCode || !bookmaker || !totalOdds || !expiresAt) {
      console.warn("❌ Missing required fields", {
        league, teamA, teamB, bookingCode, bookmaker
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const foundPlan = await RolloverPlan.findById(plan);
    if (!foundPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const newTip = new RolloverTip({
      plan,
      planId: foundPlan._id,
      planName: foundPlan.name,
      odds: foundPlan.odds,
      league,
      teamA,
      teamB,
      bookingCode,
      bookmaker,
      totalOdds,
      expiresAt,
      games: games || [],
    });

    await newTip.save();
    res.status(201).json({ message: "Rollover tip created successfully", tip: newTip });
  } catch (err) {
    console.error("❌ Error uploading rollover tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};
