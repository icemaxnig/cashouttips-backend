// ✅ rolloverController.js — Final Cleaned and Fixed Version
const RolloverTip = require("../models/RolloverTip");
const RolloverPlan = require("../models/RolloverPlan");
const User = require("../models/User");
const UserRollover = require("../models/UserRollover");
const RolloverSubscription = require("../models/RolloverSubscription");


// ✅ POST /rollover/subscribe — Subscribe to a rollover plan
const subscribeToPlan = async (req, res) => {
  try {
    const { planId, walletType = "main" } = req.body;
    const userId = req.user._id;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // Check if plan exists
    const plan = await RolloverPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if user already has an active subscription to this plan
    const existingSubscription = await UserRollover.findOne({
      userId,
      plan: planId,
      isActive: true
    });

    if (existingSubscription) {
      return res.status(400).json({ message: "You already have an active subscription to this plan" });
    }

    // Check user's wallet balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const walletBalance = walletType === "main" ? user.mainWallet : user.bonusWallet;
    if (walletBalance < plan.price) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Deduct from wallet
    if (walletType === "main") {
      user.mainWallet -= plan.price;
    } else {
      user.bonusWallet -= plan.price;
    }
    await user.save();

    // Create subscription
    const subscription = new UserRollover({
      userId,
      plan: planId,
      subscribedAt: new Date(),
      isActive: true,
      duration: plan.duration,
      startDate: new Date()
    });

    await subscription.save();

    res.status(201).json({ 
      message: "Successfully subscribed to rollover plan",
      subscription: {
        planId: plan._id,
        planName: plan.name,
        duration: plan.duration,
        subscribedAt: subscription.subscribedAt
      }
    });

  } catch (err) {
    console.error("❌ Error subscribing to plan:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

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
    
    // Use UserRollover model to get active subscriptions
    const now = new Date();
    const activeSubscriptions = await UserRollover.find({
      userId,
      isActive: true
    }).populate("plan").lean();

    const result = activeSubscriptions
      .filter(sub => {
        if (!sub.plan) return false;
        
        const startDate = new Date(sub.startDate);
        const endDate = new Date(startDate.getTime() + (sub.duration * 24 * 60 * 60 * 1000));
        
        return now <= endDate; // Subscription is still active
      })
      .map((sub) => {
        const startDate = new Date(sub.startDate);
        const endDate = new Date(startDate.getTime() + (sub.duration * 24 * 60 * 60 * 1000));
        const daysLeft = Math.ceil((endDate - now) / (24 * 60 * 60 * 1000));
        
        return {
          planId: sub.plan?._id?.toString() || "unknown",
          planName: sub.plan?.name || "Unknown Plan",
          subscribedAt: sub.subscribedAt,
          expiresAt: endDate,
          daysLeft: Math.max(0, daysLeft),
          isActive: true,
          totalOdds: sub.plan?.odds || "2.0"
        };
      });

    console.log("📊 User subscriptions:", { userId, activeCount: result.length, subscriptions: result });
    res.json(result);
  } catch (err) {
    console.error("❌ Error loading user's rollover subscriptions:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Helper function to check if user is subscribed to a plan
const isUserSubscribedToPlan = async (userId, planId) => {
  try {
    const now = new Date();
    const subscription = await UserRollover.findOne({
      userId,
      plan: planId,
      isActive: true
    }).populate("plan");

    if (!subscription || !subscription.plan) return false;
    
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(startDate.getTime() + (subscription.duration * 24 * 60 * 60 * 1000));
    
    return now <= endDate; // Subscription is still active
  } catch (err) {
    console.error("❌ Error checking subscription:", err.message);
    return false;
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

exports.getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptions = await RolloverSubscription.find({ userId });
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  subscribeToPlan,
  getAllRolloverTips,
  getMyRolloverPlans,
  getAllRolloverPlansPlain,
  getTodaysRollover,
  getGroupedRolloverTips,
  isUserSubscribedToPlan,
};
