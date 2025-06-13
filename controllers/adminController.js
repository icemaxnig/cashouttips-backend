// 📁 controllers/adminController.js
const RolloverTip = require("../models/RolloverTip");
const RolloverPlan = require("../models/RolloverPlan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

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

    res.json({ message: "Login successful", admin: { id: admin._id, email: admin.email } });
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

    if (!planId || !games || !Array.isArray(games) || games.length === 0 || !totalOdds || !expiresAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const planExists = await RolloverPlan.findById(planId);
    if (!planExists) {
      return res.status(404).json({ message: "Invalid planId" });
    }

    const tip = new RolloverTip({
      plan: planId,
      games,
      totalOdds,
      note,
      expiresAt: new Date(expiresAt),
      createdAt: new Date(),
    });

    await tip.save();
    res.status(201).json({ message: "Tip uploaded successfully", tip });
  } catch (err) {
    console.error("❌ Error uploading rollover tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};