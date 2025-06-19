const express = require("express");
const router = express.Router();
const BookingCode = require("../../models/BookingCode");
const { verifyToken, isAdmin } = require("../../middleware/authMiddleware");

// List all booking codes
router.get("/booking-codes", verifyToken, isAdmin, async (req, res) => {
  try {
    const codes = await BookingCode.find().sort({ postedAt: -1 });
    res.json(codes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booking codes" });
  }
});

// Edit a booking code
router.put("/booking-code/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await BookingCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Booking code not found" });
    res.json({ message: "Booking code updated", code: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking code" });
  }
});

// Delete a booking code
router.delete("/booking-code/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await BookingCode.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking code not found" });
    res.json({ message: "Booking code deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking code" });
  }
});

module.exports = router; 