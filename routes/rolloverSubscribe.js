const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const RolloverPlan = require("../models/RolloverPlan");
const RolloverSubscription = require("../models/RolloverSubscription");
const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");

// POST /rollover/subscribe
router.post("/", verifyToken, async (req, res) => {
  const { planId, useBonus = false } = req.body;
  const userId = req.user.userId;

  console.log("🔑 Subscription request:", {
    planId,
    useBonus,
    user: userId
  });

  try {
    const plan = await RolloverPlan.findById(planId);
    if (!plan) {
      console.log("❌ Plan not found:", planId);
      return res.status(404).json({ error: "Plan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const mainWallet = Number(user.mainWallet);
    const bonusWallet = Number(user.bonusWallet);
    const price = Number(plan.price || 0);

    console.log("💰 User Wallet:", { main: mainWallet, bonus: bonusWallet });
    console.log("🧾 Plan price:", price);

    const existing = await RolloverSubscription.findOne({ user: userId, plan: planId });
    if (existing) {
      console.log("⚠️ Already subscribed");
      return res.status(400).json({ error: "Already subscribed to this plan" });
    }

    let paid = false;
    let walletType = null;

    console.log("💳 Attempting wallet deduction with:", {
      mainWallet,
      bonusWallet,
      useBonus,
      planPrice: price
    });

    if (!useBonus && mainWallet >= price) {
      console.log("✅ Paying from main wallet");
      user.mainWallet = mainWallet - price;
      walletType = "main";
      paid = true;
    } else if (useBonus && mainWallet + bonusWallet >= price) {
      console.log("✅ Paying using bonus wallet combination");
      const remaining = price - mainWallet;
      user.mainWallet = 0;
      user.bonusWallet = bonusWallet - remaining;
      walletType = "bonus";
      paid = true;
    } else {
      console.log("❌ Wallet logic failed despite apparent balance");
    }

    if (!paid) {
      console.log("❌ Insufficient balance");
      return res.status(400).json({ error: "Insufficient balance" });
    }

    if (walletType) {
      await WalletTransaction.create({
        userId,
        type: "debit",
        wallet: walletType,
        amount: price,
        description: `Subscribed to rollover plan ${plan.name}`
      });
    }

    await RolloverSubscription.create({
      user: userId,
      plan: planId,
      planType: plan.name || String(plan.odds),
      amount: price,
      startDate: new Date()
    });

    await user.save();
    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error("❌ Subscription error:", err);
    res.status(500).json({ error: "Failed to subscribe to plan" });
  }
});

module.exports = router;