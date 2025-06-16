const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const WalletTransaction = require("../../models/WalletTransaction");

router.post("/wallet-adjust", async (req, res) => {
  const { userId, wallet, type, amount } = req.body;

  try {
    if (!userId || !wallet || !type || !amount)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (wallet === "main") {
      user.mainWallet = type === "credit"
        ? user.mainWallet + amount
        : user.mainWallet - amount;
    } else if (wallet === "bonus") {
      user.bonusWallet = type === "credit"
        ? user.bonusWallet + amount
        : user.bonusWallet - amount;
    } else {
      return res.status(400).json({ message: "Invalid wallet type" });
    }

    await user.save();
    const transaction = await WalletTransaction.create({
      userId,
      type,
      wallet,
      amount,
      description: `Admin ${type}ed ₦${amount} to ${wallet} wallet`
    });

    // Emit real-time update
    const io = req.app.get("io");
    io.emit(`wallet-update-${userId}`, {
      mainWallet: user.mainWallet,
      bonusWallet: user.bonusWallet,
      transaction
    });

    res.status(200).json({ message: "Wallet updated successfully", user });

  } catch (err) {
    console.error("Wallet adjustment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
