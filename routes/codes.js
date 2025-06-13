// 📁 routes/codes.js

const express = require("express");
const router = express.Router();
const BookingCode = require("../models/BookingCode");

// GET /api/codes/list
router.get("/list", async (req, res) => {
  try {
    const codes = await BookingCode.find()
      .sort({ createdAt: -1 })
      .limit(10); // Adjust limit as needed

    res.json(codes);
  } catch (err) {
    console.error("❌ Error fetching booking codes:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
