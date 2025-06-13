const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

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

module.exports = router;
