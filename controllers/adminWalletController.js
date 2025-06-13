// 📁 backend/controllers/adminWalletController.js

const User = require("../models/User");

exports.topupWallet = async (req, res) => {
  const { userId, amount, walletType } = req.body;

  if (!userId || !amount || !walletType)
    return res.status(400).json({ message: "Missing required fields" });

  if (!['main', 'bonus'].includes(walletType))
    return res.status(400).json({ message: "Invalid wallet type" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (walletType === "main") {
      user.mainWallet += Number(amount);
    } else {
      user.bonusWallet += Number(amount);
    }

    await user.save();

    res.status(200).json({ message: "Wallet updated successfully", wallet: {
      mainWallet: user.mainWallet,
      bonusWallet: user.bonusWallet
    }});
  } catch (err) {
    console.error("Topup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📁 backend/routes/admin.js
const express = require("express");
const router = express.Router();
const { topupWallet } = require("../controllers/adminWalletController");

router.patch("/topup-wallet", topupWallet);

module.exports = router;
