// 📁 routes/bookingCodes.js
const express = require("express");
const router = express.Router();
const { uploadBookingCode, getBookingCodes, buyBookingCode, getUserPurchasedCodes } = require("../controllers/bookingCodeController");
const verifyToken = require("../middleware/verifyToken");
const BookingCode = require("../models/BookingCode");

// ✅ Get all booking codes, with purchase flag
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const codes = await BookingCode.find({ 
      expiresAt: { $gt: new Date() },
      purchasedBy: { $ne: userId } // Only get codes not purchased by this user
    }).sort({ postedAt: -1 });

    const enriched = codes.map((code) => {
      const buyerCount = code.purchasedBy.length;
      return {
        ...code.toObject(),
        alreadyPurchased: false, // Since we filtered out purchased ones, this will always be false
        buyerCount,
        purchaseTime: null // Since we filtered out purchased ones, this will always be null
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ Error fetching booking codes:", err);
    res.status(500).json({ message: "Failed to fetch booking codes" });
  }
});

// ✅ Get a single booking code by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const code = await BookingCode.findById(req.params.id);
    if (!code) {
      return res.status(404).json({ message: "Booking code not found" });
    }

    // Check if user has purchased this code
    const alreadyPurchased = code.purchasedBy.includes(req.user._id);
    const buyerCount = code.purchasedBy.length;
    const purchaseEntry = code.purchaseLog?.find(p => p.userId.toString() === req.user._id.toString());

    res.json({
      ...code.toObject(),
      alreadyPurchased,
      buyerCount,
      purchaseTime: purchaseEntry?.time || null,
    });
  } catch (err) {
    console.error("❌ Error fetching booking code:", err);
    res.status(500).json({ message: "Failed to fetch booking code" });
  }
});

// ✅ Upload a booking code (admin or tipster)
router.post("/upload", verifyToken, uploadBookingCode);

// ✅ Buy a booking code
router.post("/:id/buy", verifyToken, buyBookingCode);

// ✅ Get user's purchased codes
router.get("/purchased", verifyToken, getUserPurchasedCodes);

module.exports = router;
