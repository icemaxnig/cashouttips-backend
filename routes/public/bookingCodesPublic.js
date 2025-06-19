const express = require("express");
const router = express.Router();
const BookingCode = require("../../models/BookingCode");
const sendError = require("../../utils/sendError");

// 🔓 Public - Get All Booking Codes (Not expired)
router.get("/", async (req, res) => {
  try {
    const codes = await BookingCode.find({ expiresAt: { $gt: new Date() } }).sort({ postedAt: -1 });
    res.json(codes);
  } catch (err) {
    console.error("Booking fetch failed:", err);
    sendError(res, 500, "Failed to load booking codes", err);
  }
});

// 🔓 Public - Get Single Booking Code by ID
router.get("/:id", async (req, res) => {
  try {
    const code = await BookingCode.findById(req.params.id);
    if (!code) return res.status(404).json({ message: "Booking code not found" });
    res.json(code);
  } catch (err) {
    console.error("Single fetch error:", err);
    sendError(res, 500, "Failed to load booking code", err);
  }
});

module.exports = router;
