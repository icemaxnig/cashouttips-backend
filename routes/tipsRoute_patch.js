
const express = require("express");
const router = express.Router();
const Tip = require("../models/Tip");

router.get("/past", async (req, res) => {
  try {
    const pastTips = await Tip.find({ createdAt: { $lt: new Date() } }).sort({ createdAt: -1 }).limit(10);
    res.json(pastTips);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch past tips" });
  }
});

module.exports = router;
