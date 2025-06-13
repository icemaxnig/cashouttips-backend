
// 📁 routes/publicRollover.js

const express = require("express");
const router = express.Router();
const RolloverPlan = require("../models/RolloverPlan");

// ✅ GET /rollover/plans (Public)
router.get("/plans", async (req, res) => {
  try {
    const plans = await RolloverPlan.find({}, "name odds duration price").sort({ odds: 1 });
    res.status(200).json(plans);
  } catch (err) {
    console.error("Error fetching public rollover plans:", err);
    res.status(500).json({ message: "Failed to fetch rollover plans" });
  }
});

module.exports = router;
