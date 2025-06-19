const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");
const sendError = require("../utils/sendError");

// Debug middleware
router.use((req, res, next) => {
  console.log("Wallet Routes - Request:", req.method, req.path);
  next();
});

// Get wallet balance
router.get("/balance", verifyToken, async (req, res) => {
  try {
    console.log("Fetching wallet balance for user:", req.user._id);
    const user = await User.findById(req.user._id).select("mainWallet bonusWallet");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      wallet: user.mainWallet || 0,
      bonusWallet: user.bonusWallet || 0,
      totalBalance: (user.mainWallet || 0) + (user.bonusWallet || 0)
    });
  } catch (error) {
    console.error("❌ Wallet balance fetch error:", error);
    sendError(res, 500, "Server error while fetching wallet balance", error);
  }
});

// Get wallet transactions
router.get("/transactions", verifyToken, async (req, res) => {
  try {
    console.log("Fetching wallet transactions for user:", req.user._id);
    const WalletTransaction = require("../models/WalletTransaction");
    const transactions = await WalletTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    console.error("❌ Wallet transactions fetch error:", error);
    sendError(res, 500, "Server error while fetching wallet transactions", error);
  }
});

// Get full wallet summary (mainWallet and bonusWallet)
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching wallet summary for user:", req.user._id);
    const user = await User.findById(req.user._id).select("mainWallet bonusWallet");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      mainWallet: user.mainWallet || 0,
      bonusWallet: user.bonusWallet || 0,
      totalBalance: (user.mainWallet || 0) + (user.bonusWallet || 0)
    });
  } catch (err) {
    console.error("❌ Wallet summary fetch error:", err);
    sendError(res, 500, "Server error fetching wallet", err);
  }
});

module.exports = router;
