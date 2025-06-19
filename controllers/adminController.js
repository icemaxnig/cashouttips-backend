// 📁 controllers/adminController.js
const RolloverTip = require("../models/RolloverTip");
const RolloverPlan = require("../models/RolloverPlan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const logActivity = require("../utils/logActivity");

// 🔐 Admin Authentication
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ 
      message: "Login successful", 
      token: token, // Return token in response body
      admin: { id: admin._id, email: admin.email } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // TODO: Implement password reset email logic
    res.json({ message: "Password reset instructions sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // TODO: Implement token verification and password reset logic
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin Upload Rollover Tip
exports.handleRolloverUpload = async (req, res) => {
  try {
    const { planId, games, totalOdds, note, expiresAt } = req.body;

    console.log("Received rollover tip data:", {
      planId,
      totalOdds,
      expiresAt,
      gamesCount: games?.length,
      games: games
    });

    if (!planId || !games || !Array.isArray(games) || games.length === 0 || !totalOdds || !expiresAt) {
      console.log("Missing required fields validation failed:", {
        planId: !!planId,
        games: !!games,
        isArray: Array.isArray(games),
        gamesLength: games?.length,
        totalOdds: !!totalOdds,
        expiresAt: !!expiresAt
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate games structure
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      console.log(`Validating game ${i + 1}:`, game);
      
      if (!game.league || !game.kickoff || !game.odds || !game.bookmaker || !game.bookingCode) {
        console.log(`Game ${i + 1} missing required fields:`, {
          league: !!game.league,
          kickoff: !!game.kickoff,
          odds: !!game.odds,
          bookmaker: !!game.bookmaker,
          bookingCode: !!game.bookingCode
        });
        return res.status(400).json({ 
          message: `Game ${i + 1} is missing required fields: league, kickoff, odds, bookmaker, bookingCode` 
        });
      }
      
      // Ensure teams field is present (either teams or teamA+teamB)
      if (!game.teams && (!game.teamA || !game.teamB)) {
        console.log(`Game ${i + 1} teams validation failed:`, {
          teams: game.teams,
          teamA: game.teamA,
          teamB: game.teamB
        });
        return res.status(400).json({ 
          message: `Game ${i + 1} must have either 'teams' field or both 'teamA' and 'teamB' fields` 
        });
      }
    }

    const planExists = await RolloverPlan.findById(planId);
    if (!planExists) {
      return res.status(404).json({ message: "Invalid planId" });
    }

    // Calculate the day index automatically based on current date
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayIndex = Math.floor(startOfDay.getTime() / (1000 * 60 * 60 * 24)) + 1; // Days since epoch

    console.log("Calculated day index:", dayIndex);

    // Check if tip already exists for this plan and day
    const existingTip = await RolloverTip.findOne({ plan: planId, dayIndex });
    if (existingTip) {
      return res.status(400).json({ message: `Tip already exists for plan ${planId} on day ${dayIndex}` });
    }

    const tip = new RolloverTip({
      plan: planId,
      dayIndex: dayIndex,
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
      createdAt: new Date(),
    });

    await tip.save();
    await logActivity({ userId: req.user._id, type: "CreateRolloverTip", description: `Uploaded tip for plan ${planId}` });
    res.status(201).json({ message: "Tip uploaded successfully", tip });
  } catch (err) {
    console.error("❌ Error uploading rollover tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};