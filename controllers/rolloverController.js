// ✅ rolloverController.js — Final Cleaned and Fixed Version
const RolloverTip = require("../models/RolloverTip");
const RolloverPlan = require("../models/RolloverPlan");
const RolloverSubscription = require("../models/RolloverSubscription");

// ✅ GET /rollover/all — For public view or dashboard widget
const getAllRolloverTips = async (req, res) => {
  try {
    const tips = await RolloverTip.find().populate("plan").lean();

    const grouped = {};
    tips.forEach((tip) => {
      const planId = tip.plan?._id?.toString();
      if (!planId) return; // Skip tips with no plan

      if (!grouped[planId]) {
        grouped[planId] = {
          planId,
          planName: tip.plan.name,
          totalOdds: tip.totalOdds,
          tips: [],
        };
      }
      grouped[planId].tips.push(tip);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("❌ Failed to fetch rollover tips:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET /rollover/my — For logged-in user's subscriptions
const getMyRolloverPlans = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptions = await RolloverSubscription.find({ user: userId })
      .populate("plan")
      .lean();

    const result = subscriptions.map((sub) => ({
      planId: sub.plan?._id?.toString() || "unknown",
      planName: sub.plan?.name || "Unknown Plan",
      subscribedAt: sub.createdAt,
      expiresAt: sub.expiresAt,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error loading user's rollover subscriptions:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET /rollover/plans/all — For /subscribe page (raw list)
const getAllRolloverPlansPlain = async (req, res) => {
  try {
    const plans = await RolloverPlan.find().sort({ createdAt: -1 }).lean();
    res.json(plans);
  } catch (err) {
    console.error("❌ Error fetching all plans:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ GET /rollover/today — Today's tips by date match
const getTodaysRollover = async (req, res) => {
  try {
    const tips = await RolloverTip.find().populate("plan").lean();
    const today = new Date().toISOString().split("T")[0];

    const todaysTips = tips.filter((tip) => {
      if (!tip.expiresAt) return false;
      const date = new Date(tip.expiresAt);
      if (isNaN(date.getTime())) return false;
      return date.toISOString().startsWith(today);
    });

    res.json(todaysTips);
  } catch (err) {
    console.error("❌ Error fetching today's rollover tips:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET /rollover/grouped — Grouped tips by plan
const getGroupedRolloverTips = async (req, res) => {
  try {
    const tips = await RolloverTip.find().populate("plan").lean();

    const grouped = {};
    tips.forEach((tip) => {
      const planId = tip.plan?._id?.toString();
      if (!planId) return;

      if (!grouped[planId]) {
        grouped[planId] = {
          planId,
          planName: tip.plan.name,
          totalOdds: tip.totalOdds,
          tips: [],
        };
      }
      grouped[planId].tips.push(tip);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("❌ Failed to group rollover tips:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  getAllRolloverTips,
  getMyRolloverPlans,
  getAllRolloverPlansPlain,
  getTodaysRollover,
  getGroupedRolloverTips,
  };
