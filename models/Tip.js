const mongoose = require("mongoose");

const TipSchema = new mongoose.Schema({
  title: String,
  odds: Number,
  bookingCode: String,
  category: {
    type: String,
    enum: ["free", "rollover", "premium"],
    required: true
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Tip || mongoose.model("Tip", TipSchema);
