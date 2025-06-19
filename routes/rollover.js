// 📁 routes/rollover.js

const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken"); // ✅ FIXED
const RolloverPlan = require("../models/RolloverPlan");
const UserRollover = require("../models/UserRollover");

const rolloverController = require("../controllers/rolloverController");
const { getActiveRolloverForUser } = require("../controllers/rolloverAccessController");
const sendError = require("../utils/sendError");

// Debug logs

// ✅ Subscribe to a plan (secured)
router.post("/subscribe", verifyToken, rolloverController.subscribeToPlan);

// ✅ Get all rollover tips (for dashboard preview)
router.get("/all", rolloverController.getAllRolloverTips);

// ✅ Get today's rollover tips
router.get("/today", rolloverController.getTodaysRollover);

// ✅ Get public plans (for preview/subscription)
router.get("/plans", async (req, res) => {
  try {
    const plans = await RolloverPlan.find({ price: { $gt: 0 }, duration: { $gt: 0 } }).sort({ createdAt: -1 });

    const enhanced = plans.map((plan, index) => {
      const createdAt = new Date(plan.createdAt).getTime();
      const ageMinutes = Math.floor((Date.now() - createdAt) / 60000);
      const startCount = 100 + index * 20;
      const fakeSubscribers = startCount + Math.floor(ageMinutes * 1.7);

      return {
        ...plan.toObject(),
        fakeSubscribers,
      };
    });

    res.status(200).json(enhanced);
  } catch (err) {
    console.error("❌ Failed to fetch rollover plans:", err);
    sendError(res, 500, "Server error", err);
  }
});

// ✅ Get all plans (for subscribe page)
router.get("/plans/all", rolloverController.getAllRolloverPlansPlain);

// ✅ Get user subscriptions (secured)
router.get("/my", verifyToken, rolloverController.getMyRolloverPlans);

// ✅ Telegram Bot Access
router.get("/flex-active", getActiveRolloverForUser);

module.exports = router;
