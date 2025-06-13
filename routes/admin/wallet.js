// 📁 routes/admin/wallet.js

const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const verifyToken = require("../../middleware/verifyToken");
const checkRole = require("../../middleware/roleMiddleware");

const verifyAdmin = [verifyToken, checkRole("admin")];

// ✅ GET all users (for Top Up form)
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "_id name email telegramId").sort({ createdAt: -1 }).limit(100);
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
