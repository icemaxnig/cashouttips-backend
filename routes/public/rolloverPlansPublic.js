// routes/public/rolloverPlansPublic.js
const express = require("express");
const router = express.Router();
const RolloverPlan = require("../../models/RolloverPlan");

router.get("/", async (req, res) => {
  try {
    const plans = await RolloverPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error("❌ Failed to fetch rollover plans", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
