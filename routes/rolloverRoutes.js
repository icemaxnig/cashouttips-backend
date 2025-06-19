const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const sendError = require("../utils/sendError");

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
  isUserSubscribedToPlan,
} = require("../controllers/rolloverController");


// ✅ Public: Get all grouped tips
router.get("/all", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const tips = await RolloverTip.find({ expiresAt: { $gt: now } })
      .populate("plan")
      .sort({ createdAt: -1 })
      .lean();

    const grouped = {};

    tips.forEach((tip) => {
      const planId = tip.plan?._id?.toString();
      if (!planId) return;

      if (!grouped[planId]) {
        grouped[planId] = {
          planId,
          planName: tip.plan.name,
          totalOdds: tip.totalOdds || tip.plan.odds || null,
          tips: [],
        };
      }

      grouped[planId].tips.push({
        games: tip.games,
        tip: tip.tip,
        note: tip.note,
        stake: tip.stake,
        bookingCode: tip.bookingCode,
        expiresAt: tip.expiresAt,
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("❌ Error in /rollover/all:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ User: Get tips for subscribed plans
router.get("/my", verifyToken, getMyRolloverPlans);

// ✅ Public: Get today's grouped tips
router.get("/today", verifyToken, getTodaysRollover);
router.get("/grouped", getGroupedRolloverTips);

// ✅ User: Get today's tips with subscription status
router.get("/today-with-status", verifyToken, async (req, res) => {
  try {
    const tips = await RolloverTip.find().populate("plan").lean();
    const today = new Date().toISOString().split("T")[0];

    const todaysTips = tips.filter((tip) => {
      if (!tip.expiresAt) return false;
      const date = new Date(tip.expiresAt);
      if (isNaN(date.getTime())) return false;
      return date.toISOString().startsWith(today);
    });

    // Check subscription status for each tip
    const tipsWithStatus = await Promise.all(
      todaysTips.map(async (tip) => {
        const isSubscribed = await isUserSubscribedToPlan(req.user._id, tip.plan._id);
        return {
          ...tip,
          isSubscribed,
          locked: !isSubscribed
        };
      })
    );

    res.json(tipsWithStatus);
  } catch (err) {
    console.error("❌ Error fetching today's tips with status:", err.message);
    sendError(res, 500, "Server error", err.message);
  }
});

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
    sendError(res, 500, "Failed to load plans", err);
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
  console.log("🔑 Subscription request:", {
    body: req.body,
    user: req.user?._id,
    headers: req.headers
  });

  const { planId, walletType } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    console.log("❌ Missing userId");
    sendError(res, 400, "User not authenticated", null);
    return;
  }

  if (!planId) {
    console.log("❌ Missing planId");
    sendError(res, 400, "Plan ID is required", null);
    return;
  }

  if (!walletType || !["main", "bonus"].includes(walletType)) {
    console.log("❌ Invalid walletType:", walletType);
    sendError(res, 400, "Wallet type must be 'main' or 'bonus'", null);
    return;
  }

  try {
    const plan = await RolloverPlan.findById(planId);
    if (!plan) {
      console.log("❌ Plan not found:", planId);
      sendError(res, 404, "Plan not found", null);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      sendError(res, 404, "User not found", null);
      return;
    }

    const alreadySubscribed = user.rolloverPlans?.some(
      (p) => p.plan?.toString() === plan._id.toString()
    );
    if (alreadySubscribed) {
      console.log("❌ Already subscribed to plan:", planId);
      sendError(res, 400, "Already subscribed to this plan", null);
      return;
    }

    const amount = plan.price;
    const balance = walletType === "bonus" ? user.bonusWallet : user.mainWallet;

    if (balance < amount) {
      console.log("❌ Insufficient balance:", { balance, amount, walletType });
      sendError(res, 400, `Insufficient ${walletType} wallet balance. Required: ₦${amount.toLocaleString()}, Available: ₦${balance.toLocaleString()}`, null);
      return;
    }

    // Deduct from appropriate wallet
    if (walletType === "bonus") {
      user.bonusWallet -= amount;
    } else {
      user.mainWallet -= amount;
    }

    // Add subscription
    user.rolloverPlans = user.rolloverPlans || [];
    user.rolloverPlans.push({
      plan: plan._id,
      startDate: new Date(),
      duration: plan.duration,
    });

    await user.save();
    console.log("✅ Subscription successful:", { userId, planId, walletType, amount });
    sendError(res, 200, "Subscription successful", { 
      newBalance: walletType === "bonus" ? user.bonusWallet : user.mainWallet
    });
  } catch (err) {
    console.error("❌ Error in subscription:", err.message);
    sendError(res, 500, "Server error", err.message);
  }
});

// ✅ All plans (raw) for /subscribe page - MUST come before /plans/:id
router.get("/plans/all", verifyToken, getAllRolloverPlansPlain);

// ✅ Get a specific plan by ID
router.get("/plans/:id", verifyToken, async (req, res) => {
  try {
    const plan = await RolloverPlan.findById(req.params.id);
    if (!plan) return sendError(res, 404, "Plan not found", null);

    const user = await User.findById(req.user._id);
    const alreadySubscribed = user?.rolloverPlans?.some(
      (p) => p.plan.toString() === plan._id.toString()
    );

    res.json({ ...plan.toObject(), alreadySubscribed });
  } catch (err) {
    console.error("❌ Error fetching plan by ID:", err.message);
    sendError(res, 500, "Server error", err.message);
  }
});

// ✅ Get user rollover subscriptions
router.get("/my-subscriptions", verifyToken, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const user = await User.findById(userId).populate("rolloverPlans.plan");
    if (!user || !user.rolloverPlans) return res.json([]);

    const subscriptions = user.rolloverPlans
      .map((sub) => {
        if (!sub.plan) return null;
        return {
          planId: sub.plan._id,
          name: sub.plan.name,
          odds: sub.plan.odds,
          startDate: sub.startDate,
          duration: sub.duration,
          expiresAt: new Date(new Date(sub.startDate).getTime() + sub.duration * 86400000),
        };
      })
      .filter((sub) => sub !== null);

    res.json(subscriptions);
  } catch (error) {
    console.error("❌ Error fetching user subscriptions:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
