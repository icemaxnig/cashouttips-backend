const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Rollover = require("../models/Rollover");
const sendError = require("../utils/sendError");

// GET /api/rollover/active
router.get("/active", auth, async (req, res) => {
  try {
    const plan = await Rollover.findOne({
      user: req.user.id,
      status: "active"
    }).sort({ createdAt: -1 });

    if (!plan) {
      return res.status(404).json({ message: "No active subscription found." });
    }

    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

router.get("/flex-active", async (req, res) => {
  try {
    const { telegramId, userId } = req.query;
    let userIdToUse = userId;

    if (telegramId) {
      const User = require("../models/User");
      const user = await User.findOne({ telegramId });
      if (!user) return res.status(404).json({ message: "User not found by telegramId" });
      userIdToUse = user._id;
    }

    const Rollover = require("../models/Rollover");
    const plan = await Rollover.findOne({
      user: userIdToUse,
      status: "active"
    }).sort({ createdAt: -1 });

    if (!plan) {
      return res.status(404).json({ message: "No active subscription found." });
    }

    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});
