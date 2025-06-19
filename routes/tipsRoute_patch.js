const express = require("express");
const router = express.Router();
const Tip = require("../models/Tip");
const sendError = require("../utils/sendError");

router.get("/past", async (req, res) => {
  try {
    const pastTips = await Tip.find({ createdAt: { $lt: new Date() } }).sort({ createdAt: -1 }).limit(10);
    res.json(pastTips);
  } catch (err) {
    sendError(res, 500, "Failed to fetch past tips", err);
  }
});

module.exports = router;
