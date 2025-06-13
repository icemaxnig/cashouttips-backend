const UserRollover = require('../models/UserRollover');
const RolloverPlan = require("../models/RolloverPlan");
const RolloverTip = require("../models/RolloverTip");
const User = require('../models/User');

// Upload Rollover (placeholder - not yet implemented)
exports.uploadRollover = async (req, res) => {
  try {
    return res.status(200).json({ message: "Rollover uploaded (placeholder)" });
  } catch (err) {
    console.error("❌ Failed to upload rollover:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get public plans with fake subscriber count
exports.getPublicPlans = async (req, res) => {
  try {
    const plans = await RolloverPlan.find({ price: { $gt: 0 }, duration: { $gt: 0 } }).sort({ createdAt: -1 });

    const enhanced = plans.map((plan, index) => {
      const createdAt = new Date(plan.createdAt).getTime();
      const ageMinutes = Math.floor((Date.now() - createdAt) / 60000);
      const startCount = 100 + (index * 20);
      const fakeSubscribers = startCount + Math.floor(ageMinutes * 1.7);

      return {
        ...plan.toObject(),
        fakeSubscribers
      };
    });

    res.json(enhanced);
  } catch (err) {
    console.error("❌ Error fetching plans:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ For Dashboard Preview: Limit to 2 upcoming tips
exports.getTodaysRollover = async (req, res) => {
  try {
    const now = new Date();

    const tips = await RolloverTip.find({
      expiresAt: { $gte: now }, // show only valid tips
    })
      .populate("plan", "name")
      .sort({ createdAt: -1 })
      .limit(2); // dashboard preview

    const mapped = tips.map((tip) => ({
      _id: tip._id,
      planId: tip.plan._id,
      planName: tip.plan.name,
      dayIndex: tip.dayIndex,
      games: tip.games,
      totalOdds: tip.totalOdds,
      note: tip.note,
      expiresAt: tip.expiresAt,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("❌ Error fetching today's rollover tips:", err);
    res.status(500).json({ message: "Failed to load rollover tips" });
  }
};

// ✅ For Full Viewer: Group tips by plan
exports.getGroupedRolloverTips = async (req, res) => {
  try {
    const now = new Date();

    const tips = await RolloverTip.find({
      expiresAt: { $gte: now },
    })
      .populate("plan", "name odds duration")
      .sort({ createdAt: -1 });

    const grouped = {};

    tips.forEach((tip) => {
      const key = tip.plan._id.toString();
      if (!grouped[key]) {
        grouped[key] = {
          planId: tip.plan._id,
          planName: tip.plan.name,
          odds: tip.plan.odds,
          duration: tip.plan.duration,
          tips: [],
        };
      }
      grouped[key].tips.push({
        _id: tip._id,
        dayIndex: tip.dayIndex,
        games: tip.games,
        totalOdds: tip.totalOdds,
        note: tip.note,
        expiresAt: tip.expiresAt,
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("❌ Error fetching grouped rollover tips:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Subscribe to a rollover plan
exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId, wallet } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const plan = await RolloverPlan.findById(planId);
    if (!user || !plan) {
      return res.status(404).json({ message: "User or plan not found" });
    }

    const alreadySubscribed = await UserRollover.findOne({ userId, plan: planId });
    if (alreadySubscribed) {
      return res.status(400).json({ message: "Already subscribed to this plan" });
    }

    if (!["main", "bonus"].includes(wallet)) {
      return res.status(400).json({ message: "Invalid wallet type" });
    }

    if (wallet === "main") {
      if (user.mainWallet < plan.price) {
        return res.status(400).json({ message: "Insufficient main wallet balance" });
      }
      user.mainWallet -= plan.price;
    } else {
      if (user.bonusWallet < plan.price) {
        return res.status(400).json({ message: "Insufficient bonus wallet balance" });
      }
      user.bonusWallet -= plan.price;
    }

    await user.save();

    await UserRollover.create({
      userId: user._id,
      plan: plan._id,
      subscribedAt: new Date(),
    });

    res.status(200).json({ message: "Subscription successful" });
  } catch (err) {
    console.error("❌ Subscription error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
