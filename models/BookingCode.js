// 📄 models/BookingCode.js
const mongoose = require("mongoose");

const bookingCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  odds: { type: Number, required: true },
  bookmaker: { type: String, required: true },
  urgencyTag: { type: String, default: "🔥 Hot" },
  slotLimit: { type: Number, default: 100 },
  price: { type: Number, default: 300 },
  successRate: { type: Number, default: 60 },
  expiresAt: { type: Date, required: true },
  postedAt: { type: Date, default: Date.now },
  purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  purchaseLog: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    time: { type: Date, default: Date.now }
  }],
  note: { type: String },
});

module.exports = mongoose.model("BookingCode", bookingCodeSchema);
