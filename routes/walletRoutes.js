const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getBalance } = require("../controllers/walletController");
const WalletTransaction = require("../models/WalletTransaction");

// Get wallet balance
router.get("/balance", verifyToken, getBalance);

// Get wallet transactions
router.get("/transactions", verifyToken, async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    console.error("❌ Wallet transactions fetch error:", error);
    res.status(500).json({ message: "Server error while fetching wallet transactions" });
  }
});

module.exports = router;
