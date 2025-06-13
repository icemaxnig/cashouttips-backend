// ✅ PATCH for booking routes
const express = require("express");
const router = express.Router();
const BookingCode = require("../models/BookingCode");
const verifyToken = require("../middleware/verifyToken");

// ✅ Get all booking codes with purchase status
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;
    const purchased = await BookingCode.find({ purchasedBy: userId }, "_id");
    const ids = purchased.map(c => c._id);
    res.json(ids);
  } catch (err) {
    console.error("Error fetching purchased list:", err);
    res.status(500).json({ error: "Failed to fetch purchase list" });
  }
});

module.exports = router;
