
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
    if (!bookingCode) return res.status(404).json({ error: "Code not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.mainWallet < bookingCode.price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const alreadyPurchased = await BookingPurchase.findOne({ userId, codeId });
    if (alreadyPurchased) {
      return res.status(400).json({ error: "Already purchased" });
    }

    // Deduct from user's main wallet
    user.mainWallet -= bookingCode.price;
    await user.save();

    // Record purchase
    const purchase = await BookingPurchase.create({ userId, codeId });
    res.json({ success: true, purchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Purchase failed" });
  }
});

module.exports = router;
