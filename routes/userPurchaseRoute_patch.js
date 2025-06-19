const express = require("express");
const router = express.Router();
const BookingPurchase = require("../models/BookingPurchase");
const verifyToken = require("../middleware/verifyToken");
const sendError = require("../utils/sendError");

// Get all purchased codes
router.get("/purchased-codes", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    let purchases = await BookingPurchase.find({ user: userId })
      .populate({
        path: 'code',
        select: 'bookmaker code odds urgencyTag expiresAt price'
      })
      .sort({ createdAt: -1 });

    // ✅ Map in fallback for deleted or expired codes
    const enhanced = purchases.map(p => {
      if (p.code === null) {
        return {
          _id: p._id,
          user: p.user,
          code: {
            _id: null,
            code: "[Deleted]",
            odds: null,
            bookmaker: "[Removed]",
            urgencyTag: "N/A",
            expiresAt: null,
            price: null,
            status: "deleted",
          },
          price: p.price,
          fromBonus: p.fromBonus,
          fromMain: p.fromMain,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          __v: p.__v
        };
      }

      return {
        ...p.toObject(),
        code: {
          ...p.code.toObject(),
          status: "active",
        }
      };
    });

    res.json(enhanced);
  } catch (err) {
    console.error("❌ Error fetching purchases:", err);
    sendError(res, 500, "Failed to fetch purchased codes", err);
  }
});

// Get single purchased code details
router.get("/purchased-codes/:id", verifyToken, async (req, res) => {
  try {
    const purchase = await BookingPurchase.findOne({
      code: req.params.id,
      user: req.user._id
    }).populate({
      path: 'code',
      select: 'bookmaker code odds urgencyTag expiresAt price'
    });

    if (!purchase || !purchase.code) {
      return res.status(404).json({ error: "Purchase not found or code has been deleted" });
    }

    res.json({
      ...purchase.code.toObject(),
      status: "active"
    });
  } catch (err) {
    console.error("❌ Error fetching purchase details:", err);
    sendError(res, 500, "Failed to fetch purchase details", err);
  }
});

module.exports = router;
