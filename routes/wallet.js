// routes/wallet.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");
const Wallet = mongoose.models.Wallet || require("../models/Wallet");

// ?? Get wallet balances (main + bonus)
router.get("/", verifyToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json({
      mainWallet: wallet.balance || 0,
      bonusWallet: wallet.bonusBalance || 0,
    });
  } catch (err) {
    console.error("Wallet fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
