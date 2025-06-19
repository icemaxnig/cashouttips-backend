const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const RolloverSubscription = require("../models/RolloverSubscription");
const RolloverPlan = require("../models/RolloverPlan");

// GET /rollover/my-subscriptions
router.get("/my-subscriptions", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const subs = await RolloverSubscription.find({ userId: userId }).populate("plan");
    const today = new Date();

    const enriched = subs.map((sub) => {
      const { plan, startDate } = sub;
      const elapsedMs = today - new Date(startDate);
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      const currentDay = elapsedDays + 1;
      const isActive = currentDay <= plan.duration;

      return {
        planId: plan._id,
        planName: plan.name,
        odds: plan.odds,
        duration: plan.duration,
        price: plan.price,
        currentDay,
        isActive,
        startDate,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ Failed to fetch rollover subscriptions:", err);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

module.exports = router;