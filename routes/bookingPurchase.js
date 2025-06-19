const express = require("express");
const router = express.Router();
const BookingCode = require("../models/BookingCode");
const BookingPurchase = require("../models/BookingPurchase");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const sendError = require("../utils/sendError");

router.post("/purchase/:id", verifyToken, async (req, res) => {
  const userId = req.user._id;
  const codeId = req.params.id;

  try {
    const bookingCode = await BookingCode.findById(codeId);
    if (!bookingCode) return sendError(res, 404, "Code not found");

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found");

    if (user.mainWallet < bookingCode.price) {
      return sendError(res, 400, "Insufficient balance");
    }

    const alreadyPurchased = await BookingPurchase.findOne({ userId, codeId });
    if (alreadyPurchased) {
      return sendError(res, 400, "Already purchased");
    }

    // Deduct from user's main wallet
    user.mainWallet -= bookingCode.price;
    await user.save();

    // Record purchase
    const purchase = await BookingPurchase.create({ userId, codeId });
    res.json({ success: true, purchase });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Purchase failed");
  }
});

module.exports = router;
