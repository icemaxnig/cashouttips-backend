const mongoose = require("mongoose");

const bookingCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  bookmaker: { type: String },
  amount: { type: Number, required: true },
  confidence: { type: Number },
  note: { type: String },
  expiresAt: { type: Date, required: true },
  pushToTelegram: { type: Boolean, default: false },
  pushToWeb: { type: Boolean, default: true },
  purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("BookingCode", bookingCodeSchema);
