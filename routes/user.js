const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const auth = require("../middleware/auth");
const sendError = require("../utils/sendError");

// ✅ Dashboard: current user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in /users/me:", err.message);
    sendError(res, 500, "Server error", err);
  }
});

// ✅ Admin Panel: secure all users fetch
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("name email _id mainWallet bonusWallet telegramId");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    sendError(res, 500, "Failed to fetch users", err);
  }
});

router.get("/all", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("name email _id");
    res.status(200).json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    sendError(res, 500, "Server error", err);
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
    sendError(res, 500, "Server error", err);
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
    sendError(res, 500, "Server error", err);
  }
});

// Subscription status endpoint
router.get("/subscription-status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isSubscribed = !!user.isSubscribed;
    const subscriptionStart = user.subscriptionStart;
    let expiryDate = null;
    let daysLeft = null;
    if (isSubscribed && subscriptionStart) {
      expiryDate = new Date(new Date(subscriptionStart).getTime() + 30 * 24 * 60 * 60 * 1000);
      daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    }
    res.json({ isSubscribed, subscriptionStart, expiryDate, daysLeft });
  } catch (err) {
    sendError(res, 500, "Failed to fetch subscription status", err);
  }
});

module.exports = router;
