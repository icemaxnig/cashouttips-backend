const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const SubscriptionHistory = require("../models/SubscriptionHistory");

router.get("/history", auth, async (req, res) => {
  try {
    const history = await SubscriptionHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;