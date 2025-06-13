const mongoose = require("mongoose");

const rolloverSchema = new mongoose.Schema({
  day: String,
  bookmaker: String,
  code: String,
  odds: Number,
  status: { type: String, default: "pending" }, // pending, won, lost
}, { timestamps: true });

module.exports = mongoose.model("Rollover", rolloverSchema);