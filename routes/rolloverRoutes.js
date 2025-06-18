// ✅ rolloverRoutes.js — Cleaned and Organized
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const User = require("../models/User");
const RolloverPlan = require("../models/RolloverPlan");
const RolloverTip = require("../models/RolloverTip");

const {
  createPlan,
  getPublicPlans,
  updatePlan,
  deletePlan,
} = require("../controllers/rolloverPlanController");

const { createRolloverGame } = require("../controllers/rolloverGameController");

const {
  getTodaysRollover,
  getGroupedRolloverTips,
  getAllRolloverTips,
  getMyRolloverPlans,
  getAllRolloverPlansPlain,
} = require("../controllers/rolloverController");

// ✅ Public: Get all grouped tips
router.get("/all", getAllRolloverTips);

// ✅ User: Get tips for subscribed plans
router.get("/my", verifyToken, getMyRolloverPlans);

// ✅ Public: Get today's grouped tips
router.get("/today", verifyToken, getTodaysRollover);
router.get("/grouped", getGroupedRolloverTips);

// ✅ User: View available plans with status
router.get("/plans", verifyToken, async (req, res) => {
  try {
    const allPlans = await RolloverPlan.find().sort({ createdAt: -1 }).lean();
    const now = new Date();
    const slot = Math.floor(now.getTime() / (5 * 60 * 1000));
    const startIndex = (slot % Math.max(1, Math.floor(allPlans.length / 4))) * 4;
    const selectedPlans = allPlans.slice(startIndex, startIndex + 4);

    const user = await User.findById(req.user._id);
    const activePlans = user?.rolloverPlans || [];

    const enriched = selectedPlans.map((plan) => {
      const subscribed = activePlans.some(p => p.plan?.toString() === plan._id.toString());
      const fakeSubs = plan.fakeStart + Math.floor((Date.now() - new Date(plan.createdAt)) / (1000 * 60 * 60)) * plan.growthRatePerHour;
      return {
        ...plan,
        alreadySubscribed: subscribed,
        fakeSubscribers: Math.floor(fakeSubs),
        cta: {
          text: subscribed ? "View Details" : "Subscribe Now",
          link: `/rollover-plans/${plan._id}`,
          type: subscribed ? "view" : "subscribe",
        },
        metadata: {
          successRate: `${plan.successRate || 75}% Success Rate`,
          subscribers: `${Math.floor(fakeSubs)} Active Subscribers`,
          duration: `${plan.duration} Days Access`,
          odds: `${plan.odds}x Daily Odds`,
        },
      };
    });

    res.json({ plans: enriched });
  } catch (err) {
    console.error("❌ Error loading plans:", err);
    res.status(500).json({ message: "Failed to load plans" });
  }
});

// ✅ Admin: Create/Update/Delete Plans
router.post("/admin/plans", createPlan);
router.put("/admin/plan/:id", updatePlan);
router.delete("/admin/plan/:id", deletePlan);

// ✅ Admin: Upload games
router.post("/admin/game", createRolloverGame);

// ✅ Subscribe to a plan
router.post("/subscribe", verifyToken, async (req, res) => {
  const { planId, walletType } = req.body;
  const userId = req.user?._id;

  if (!userId || !planId || !walletType)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const plan = await RolloverPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySubscribed = user.rolloverPlans?.some(
      (p) => p.plan?.toString() === plan._id.toString()
    );
    if (alreadySubscribed) {
      return res.status(400).json({ message: "Already subscribed to this plan" });
    }

    const amount = plan.price;

    if (walletType === "bonus") {
      if (user.bonusWallet < amount) {
        return res.status(400).json({ message: "Insufficient bonus wallet balance" });
      }
      user.bonusWallet -= amount;
    } else {
      if (user.mainWallet < amount) {
        return res.status(400).json({ message: "Insufficient main wallet balance" });
      }
      user.mainWallet -= amount;
    }

    user.rolloverPlans = user.rolloverPlans || [];
    user.rolloverPlans.push({
      plan: plan._id,
      startDate: new Date(),
      duration: plan.duration,
    });

    await user.save();
    return res.status(200).json({ message: "Subscription successful" });
  } catch (err) {
    console.error("❌ Error in subscription:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ All plans (raw) for /subscribe page - MUST come before /plans/:id
router.get("/plans/all", verifyToken, getAllRolloverPlansPlain);

// ✅ Get a specific plan by ID
router.get("/plans/:id", verifyToken, async (req, res) => {
  try {
    const plan = await RolloverPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const user = await User.findById(req.user.userId);
    const alreadySubscribed = user?.rolloverPlans?.some(
      (p) => p.plan.toString() === plan._id.toString()
    );

    res.json({ ...plan.toObject(), alreadySubscribed });
  } catch (err) {
    console.error("❌ Error fetching plan by ID:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
