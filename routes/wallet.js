// routes/wallet.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");
const Wallet = mongoose.models.Wallet || require("../models/Wallet");
const sendError = require("../utils/sendError");

// ?? Get wallet balances (main + bonus)
router.get("/", verifyToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet) {
      return sendError(res, 404, "Wallet not found");
    }

    res.json({
      mainWallet: wallet.balance || 0,
      bonusWallet: wallet.bonusBalance || 0,
    });
  } catch (err) {
    console.error("Wallet fetch error:", err.message);
    sendError(res, 500, "Server error");
  }
});

module.exports = router;
