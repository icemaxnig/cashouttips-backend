const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const BookingCode = require("../models/BookingCode");

const {
  uploadBookingCode,
  getBookingCodes,
  buyBookingCode,
  getUserPurchasedCodes,
} = require("../controllers/bookingCodeController");

// ✅ Public - Fetch all codes (with purchase status)
router.get("/", verifyToken, getBookingCodes);

// ✅ Admin uploads a booking code
router.post("/upload", verifyToken, uploadBookingCode);

// ✅ Buy a booking code
router.post("/buy/:id", verifyToken, buyBookingCode);

// ✅ Get purchased codes by user
router.get("/purchased", verifyToken, getUserPurchasedCodes);

// ✅ Get a single booking code by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const code = await BookingCode.findById(req.params.id);
    if (!code) {
      return res.status(404).json({ message: "Booking code not found" });
    }
    res.json(code);
  } catch (err) {
    console.error("Error fetching booking code:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
