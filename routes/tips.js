const express = require("express");
const router = express.Router();
const Tip = require("../models/Tip");
const verifyUserToken = require("../middleware/userAuthMiddleware");

// GET /api/tips/free
router.get("/free", async (req, res) => {
  const tips = await Tip.find({ category: "free" }).sort({ createdAt: -1 });
  res.json({ success: true, tips });
});

// GET /api/tips/rollover (auth only)
router.get("/rollover", verifyUserToken, async (req, res) => {
  const tips = await Tip.find({ category: "rollover" }).sort({ createdAt: -1 });
  res.json({ success: true, tips });
});

// GET /api/tips/premium (auth only + check wallet logic here)
router.get("/premium", verifyUserToken, async (req, res) => {
  // TODO: Check user wallet/subscription here if needed
  const tips = await Tip.find({ category: "premium" }).sort({ createdAt: -1 });
  res.json({ success: true, tips });
});

// GET /api/tips/telegram-feed (no auth, for bot)
router.get("/telegram-feed", async (req, res) => {
  const tips = await Tip.find().sort({ createdAt: -1 }).limit(5);
  res.json({ tips });
});

const verifyCodePurchase = require("../middleware/verifyCodePurchase");

router.get("/premium/:id", verifyCodePurchase, async (req, res) => {
  const tip = await Tip.findById(req.params.id);
  if (!tip) {
    return res.status(404).json({ success: false, message: "Tip not found" });
  }
  res.json({ success: true, tip });
});

// POST /api/tips/premium/:id/purchase
router.post("/premium/:id/purchase", verifyUserToken, async (req, res) => {
  try {
    const tipId = req.params.id;
    const user = req.user;

    // Check if already purchased
    if (user.purchasedBookingCodes?.includes(tipId)) {
      return res.status(400).json({ success: false, message: "Tip already purchased" });
    }

    // Price logic (can be dynamic per tip later)
    const TIP_COST = 100;
    if (user.walletBalance < TIP_COST) {
      return res.status(402).json({ success: false, message: "Insufficient balance" });
    }

    // Deduct wallet and add tip to user
    user.walletBalance -= TIP_COST;
    user.purchasedBookingCodes.push(tipId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Tip purchased successfully",
      remainingBalance: user.walletBalance,
      purchasedTipId: tipId
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Purchase failed", error: err.message });
  }
});

module.exports = router;
