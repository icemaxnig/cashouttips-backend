// 📁 admin/routes/admin/wallet.js

const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// POST /api/admin/wallet-adjust
router.post("/wallet-adjust", async (req, res) => {
  const { userId, type, amount, action } = req.body;

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

    const field = type === "main" ? "mainWallet" : "bonusWallet";

    if (action === "credit") {
      user[field] += Number(amount);
    } else {
      if (user[field] < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      user[field] -= Number(amount);
    }

    await user.save();
    res.json({ message: "Wallet updated", user });
  } catch (err) {
    console.error("Wallet adjust error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
