// ✅ PATCH for booking routes
const express = require("express");
const router = express.Router();
const BookingCode = require("../models/BookingCode");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const verifyToken = require("../middleware/verifyToken");

// ✅ Get all booking codes with purchase status
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const codes = await BookingCode.find({ expiresAt: { $gt: new Date() } }).sort({ postedAt: -1 });

    const enriched = codes.map((code) => {
      const alreadyPurchased = code.purchasedBy.includes(userId);
      const buyerCount = code.purchasedBy.length;
      const purchaseEntry = code.purchaseLog?.find(p => p.userId.toString() === userId);

      return {
        ...code.toObject(),
        alreadyPurchased,
        buyerCount,
        purchaseTime: purchaseEntry?.time || null,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching booking codes:", err);
    res.status(500).json({ error: "Failed to fetch booking codes" });
  }
});

// ✅ Get list of purchased code IDs only
router.get("/purchased", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const purchased = await BookingCode.find({ purchasedBy: userId }, "_id");
    const ids = purchased.map(c => c._id);
    res.json(ids);
  } catch (err) {
    console.error("Error fetching purchased list:", err);
    res.status(500).json({ error: "Failed to fetch purchase list" });
  }
});

// ✅ Get single booking code by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const code = await BookingCode.findById(req.params.id);
    if (!code) return res.status(404).json({ error: "Booking code not found" });

    const alreadyPurchased = code.purchasedBy.includes(userId);
    const buyerCount = code.purchasedBy.length;
    const purchaseEntry = code.purchaseLog?.find(p => p.userId.toString() === userId);

    res.json({
      ...code.toObject(),
      alreadyPurchased,
      buyerCount,
      purchaseTime: purchaseEntry?.time || null,
    });
  } catch (err) {
    console.error("Error fetching booking code by ID:", err);
    res.status(500).json({ error: "Failed to fetch booking code" });
  }
});

// ✅ POST /booking/buy/:id
router.post("/buy/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const useBonus = req.body.useBonus === true || req.body.useBonus === "true";

    const booking = await BookingCode.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.purchasedBy.includes(userId)) return res.status(400).json({ error: "Already purchased" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const price = booking.price;
    console.log("🔍 useBonus =", useBonus);
    console.log("🔍 Main wallet balance =", user.mainWallet);
    console.log("🔍 Bonus wallet balance =", user.bonusWallet);
    console.log("🔍 Code price =", price);

    let paid = false;
    let transactionType = "debit";
    let walletType = "main";

    if (!useBonus && user.mainWallet >= price) {
      user.mainWallet -= price;
      paid = true;
    } else if (useBonus && user.mainWallet + user.bonusWallet >= price) {
      const needed = price - user.mainWallet;
      user.mainWallet = 0;
      user.bonusWallet -= needed;
      paid = true;
      walletType = "bonus";
    }

    if (!paid) return res.status(400).json({ error: "Insufficient balance" });

    // Create wallet transaction record
    await WalletTransaction.create({
      userId,
      type: transactionType,
      wallet: walletType,
      amount: price,
      description: `Purchase of booking code ${booking.code}`
    });

    // Ensure arrays exist
    if (!Array.isArray(booking.purchasedBy)) booking.purchasedBy = [];
    if (!Array.isArray(booking.purchaseLog)) booking.purchaseLog = [];

    booking.purchasedBy.push(userId);
    booking.purchaseLog.push({ userId, time: new Date() });

    await user.save();
    await booking.save();

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit(`wallet-update-${userId}`, {
        mainWallet: user.mainWallet,
        bonusWallet: user.bonusWallet
      });
    }

    res.json({ success: true, message: "Booking code purchased" });
  } catch (err) {
    console.error("❌ Error purchasing booking:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;
