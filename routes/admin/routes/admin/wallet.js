// 📁 admin/routes/admin/wallet.js

const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");

// POST /api/admin/wallet-adjust
router.post("/wallet-adjust", async (req, res) => {
  const { userId, type, amount, action, reason } = req.body;

  if (!userId || !type || !amount || !action) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  if (!['main', 'bonus'].includes(type)) {
    return res.status(400).json({ message: "Invalid wallet type" });
  }

  if (!['credit', 'debit'].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId });
    }

    const field = type === "main" ? "balance" : "bonusBalance";
    const amountNum = Number(amount);

    if (action === "credit") {
      wallet[field] += amountNum;
    } else {
      if (wallet[field] < amountNum) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      wallet[field] -= amountNum;
    }

    // Add transaction record
    wallet.transactions.push({
      type: action === "credit" ? "credit" : "debit",
      amount: amountNum,
      reason: reason || `Admin ${action}`,
      method: "admin",
      date: new Date()
    });

    await wallet.save();

    // Update user's wallet reference
    user.mainWallet = wallet.balance;
    user.bonusWallet = wallet.bonusBalance;
    await user.save();

    res.json({ 
      message: "Wallet updated successfully",
      wallet: {
        mainWallet: wallet.balance,
        bonusWallet: wallet.bonusBalance
      }
    });
  } catch (err) {
    console.error("Wallet adjust error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
