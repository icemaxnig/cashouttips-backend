const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// ✅ Dashboard: current user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in /users/me:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin Panel: secure all users fetch
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("name email _id mainWallet bonusWallet telegramId");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/all", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("name email _id");
    res.status(200).json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/users/wallet
router.get("/wallet", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("mainWallet bonusWallet");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      wallet: user.mainWallet || 0,
      bonusWallet: user.bonusWallet || 0,
    });
  } catch (err) {
    console.error("❌ Error fetching wallet:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/wallets - New endpoint to match frontend expectation
router.get("/wallets", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("mainWallet bonusWallet");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      mainWallet: user.mainWallet || 0,
      bonusWallet: user.bonusWallet || 0,
      totalBalance: (user.mainWallet || 0) + (user.bonusWallet || 0)
    });
  } catch (err) {
    console.error("❌ Error fetching wallets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
