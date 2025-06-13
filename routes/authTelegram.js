const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ✅ 1. Telegram registration/login
router.post("/telegram-login", async (req, res) => {
  console.log("📥 Telegram Login Request Body:", req.body);

  try {
    const { telegramId, name, email, password } = req.body;

    if (!telegramId || !email || !password) {
      return res.status(400).json({ message: "telegramId, email and password are required" });
    }

    // Check if user already exists by email
    let user = await User.findOne({ email });

    if (user) {
      // If already linked, reject
      if (user.telegramId && user.telegramId !== telegramId) {
        return res.status(400).json({ message: "This email is already linked to another Telegram account." });
      }

      // Link Telegram ID if not already linked
      user.telegramId = telegramId;
      await user.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        telegramId,
        wallet: 0,
        bonusWallet: 0,
      });
    }

    return res.json({
      message: "Telegram registration successful",
      user: {
        id: user._id,
        name: user.name,
        telegramId: user.telegramId,
        wallet: user.wallet,
        bonusWallet: user.bonusWallet,
      },
    });

  } catch (err) {
    console.error("❌ Telegram login failed:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ 2. Telegram link for web-registered users
router.post("/link", async (req, res) => {
  try {
    const { code, telegramId, name } = req.body;

    if (!code || !telegramId) {
      return res.status(400).json({ message: "Code and Telegram ID are required" });
    }

    const user = await User.findOne({ telegramLinkCode: code });

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired link code" });
    }

    if (user.telegramId && user.telegramId !== telegramId) {
      return res.status(400).json({ message: "This account is already linked to another Telegram account." });
    }

    user.telegramId = telegramId;
    user.name = user.name || name;
    user.telegramLinkCode = undefined; // clear the code after use
    await user.save();

    res.json({ message: "Telegram linked successfully" });

  } catch (err) {
    console.error("❌ Telegram link failed:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
