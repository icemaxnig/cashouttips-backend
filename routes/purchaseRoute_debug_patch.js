const express = require("express");
const router = express.Router();
const BookingCode = require("../models/BookingCode");
const BookingPurchase = require("../models/BookingPurchase");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

router.post("/purchase/:id", verifyToken, async (req, res) => {
  const userId = req.user._id;
  const codeId = req.params.id;

  try {
    const bookingCode = await BookingCode.findById(codeId);
    const user = await User.findById(userId);

    console.log("🧪 Purchase attempt details:");
    console.log("- User ID:", userId);
    console.log("- Code ID:", codeId);
    console.log("- Code price:", bookingCode?.price);
    console.log("- User main wallet:", user?.mainWallet);
    console.log("- User bonus wallet:", user?.bonusWallet);

    if (!bookingCode) return res.status(404).json({ error: "Code not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if user has already purchased this code
    const alreadyPurchased = await BookingPurchase.findOne({ user: user._id, code: bookingCode._id });
    if (alreadyPurchased) {
      return res.status(400).json({ error: "Already purchased" });
    }

    // Check if user has sufficient balance
    const totalBalance = (user.mainWallet || 0) + (user.bonusWallet || 0);
    if (totalBalance < bookingCode.price) {
      console.log("❌ Insufficient balance:", {
        required: bookingCode.price,
        available: totalBalance,
        mainWallet: user.mainWallet,
        bonusWallet: user.bonusWallet
      });
      return res.status(400).json({ 
        error: "Insufficient balance",
        details: {
          required: bookingCode.price,
          available: totalBalance,
          mainWallet: user.mainWallet,
          bonusWallet: user.bonusWallet
        }
      });
    }

    // Deduct from main wallet first, then bonus wallet if needed
    let remainingCost = bookingCode.price;
    if (user.mainWallet >= remainingCost) {
      user.mainWallet -= remainingCost;
    } else {
      const fromMain = user.mainWallet;
      const fromBonus = remainingCost - fromMain;
      user.mainWallet = 0;
      user.bonusWallet -= fromBonus;
    }

    await user.save();

    const purchase = await BookingPurchase.create({
      user: user._id,
      code: bookingCode._id,
      price: bookingCode.price,
      fromMain: user.mainWallet,
      fromBonus: user.bonusWallet
    });

    console.log("✅ Purchase successful:", {
      purchaseId: purchase._id,
      remainingMainWallet: user.mainWallet,
      remainingBonusWallet: user.bonusWallet
    });

    res.json({ 
      success: true, 
      purchase,
      newBalance: {
        mainWallet: user.mainWallet,
        bonusWallet: user.bonusWallet
      }
    });
  } catch (err) {
    console.error("🔥 Error in /purchase/:id", err);
    res.status(500).json({ error: "Purchase failed" });
  }
});

module.exports = router;
