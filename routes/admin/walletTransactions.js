// 📁 routes/admin/walletTransactions.js
const express = require("express");
const router = express.Router();
const WalletTransaction = require("../../models/WalletTransaction");

// GET /admin/wallet-transactions/:userId
router.get("/wallet-transactions/:userId", async (req, res) => {
  try {
    const txns = await WalletTransaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(txns);
  } catch (err) {
    console.error("Failed to fetch wallet transactions", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
