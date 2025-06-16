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

const rolloverGameController = require("../controllers/rolloverGameController");
const rolloverController = require("../controllers/rolloverController");

// ✅ Public: Rollover Plans for frontend (enriched with subscription status)
router.get("/rollover-plans", verifyToken, async (req, res) => {
  try {
    const plans = await RolloverPlan.find();
    const user = await User.findById(req.user.userId);

    const activePlans = user.rolloverPlans || [];
    const enrichedPlans = plans.map((plan) => {
      const alreadySubscribed = activePlans.some(
        (p) => p.plan?.toString() === plan._id.toString()
      );
      return {
        ...plan.toObject(),
        alreadySubscribed,
      };
    });

    res.json(enrichedPlans);
  } catch (err) {
    console.error("❌ Error loading rollover plans:", err);
    res.status(500).json({ message: "Failed to load plans" });
  }
});

// ✅ Admin: Plan management
router.post("/admin/rollover-plans", createPlan);
router.put("/admin/rollover-plan/:id", updatePlan);
router.delete("/admin/rollover-plan/:id", deletePlan);

// ✅ Admin: Upload games
router.post("/admin/rollover-game", rolloverGameController.createRolloverGame);

// ✅ Rollover endpoints
router.get("/rollover/today", verifyToken, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tips = await RolloverTip.find({
      expiresAt: { $gte: new Date() },
    })
      .populate("plan", "name odds duration")
      .sort({ createdAt: -1 });

    const user = await User.findById(userId);
    const activePlans = user?.rolloverPlans || [];

    // Get all tips, but mark which ones are accessible to the user
    const enrichedTips = tips.map(tip => ({
      ...tip.toObject(),
      isLocked: !activePlans.some(p => p.plan?.toString() === tip.plan._id.toString())
    }));

    res.json(enrichedTips);
  } catch (err) {
    console.error("❌ Error fetching today's rollover tips:", err);
    res.status(500).json({ message: "Failed to load tips" });
  }
});

router.get("/rollover/grouped", rolloverController.getGroupedRolloverTips);

// ✅ My Rollover (user-specific)
router.get("/rollover/my", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tips = await RolloverTip.find({
      expiresAt: { $gte: new Date() },
    })
      .populate("plan", "name odds duration")
      .sort({ createdAt: -1 });

    const user = await User.findById(userId);
    const activePlans = user?.rolloverPlans || [];

    const myTips = tips.filter(tip =>
      activePlans.some(
        (p) => p.plan?.toString() === tip.plan._id.toString()
      )
    );

    res.json(myTips);
  } catch (err) {
    console.error("❌ Failed to load my rollover tips:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Subscribe to rollover plan
router.post("/subscribe/rollover", verifyToken, async (req, res) => {
  const { planId, walletType } = req.body;
  const userId = req.user?.userId;

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

// ✅ Get plan by ID (used in /subscribe/:id)
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

// ✅ GET /rollover/plans — used in /subscribe
router.get("/rollover/plans", async (req, res) => {
  try {
    const plans = await RolloverPlan.find({ price: { $gt: 0 }, duration: { $gt: 0 } }).sort({ createdAt: -1 });

    const enhanced = plans.map((plan, index) => {
      const createdAt = new Date(plan.createdAt).getTime();
      const ageMinutes = Math.floor((Date.now() - createdAt) / 60000);
      const offset = 100 + (index * 17);
      const fakeSubscribers = offset + Math.floor(ageMinutes * 1.5);

      return {
        ...plan.toObject(),
        fakeSubscribers
      };
    });

    res.json(enhanced);
  } catch (err) {
    console.error("❌ Error fetching rollover plans:", err);
    res.status(500).json({ message: "Failed to load plans" });
  }
});


module.exports = router;
