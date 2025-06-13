// controllers/rolloverSubscriptionController.js
const User = require("../models/User");
const RolloverPlan = require("../models/RolloverPlan");
const UserRollover = require("../models/UserRollover");

exports.subscribeToRolloverPlan = async (req, res) => {
  try {
    const { planId, walletType } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const plan = await RolloverPlan.findById(planId);
    if (!user || !plan) return res.status(404).json({ message: "User or plan not found" });

    // Check if already subscribed
    const existing = await UserRollover.findOne({ user: userId, plan: planId, status: "active" });
    if (existing) return res.status(400).json({ message: "Already subscribed to this plan" });

    // Deduct from wallet
    const price = plan.price;
    if (walletType === "main") {
      if (user.wallet < price) return res.status(400).json({ message: "Insufficient main wallet balance" });
      user.wallet -= price;
    } else if (walletType === "bonus") {
      if (user.bonusWallet < price) return res.status(400).json({ message: "Insufficient bonus wallet balance" });
      user.bonusWallet -= price;
    } else {
      return res.status(400).json({ message: "Invalid wallet type" });
    }

    const today = new Date();
    const endDate = new Date(today.getTime() + plan.duration * 86400000); // duration in days

    const sub = await UserRollover.create({
      user: userId,
      plan: planId,
      fromMain: walletType === "main" ? price : 0,
      fromBonus: walletType === "bonus" ? price : 0,
      startDate: today,
      endDate,
      status: "active"
    });

    plan.subscribers.push(userId);
    await plan.save();
    await user.save();

    return res.json({
      message: "Subscribed successfully",
      subscription: sub,
      wallet: {
        wallet: user.wallet,
        bonusWallet: user.bonusWallet
      }
    });
  } catch (err) {
    console.error("❌ Subscription failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};
