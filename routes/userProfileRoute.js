const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      wallet: user.wallet || 0,
      activePlan: user.activePlan || null,
      referralEarnings: user.referralEarnings || 0,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
});

module.exports = router;
