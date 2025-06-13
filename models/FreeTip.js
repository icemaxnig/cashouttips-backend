const mongoose = require("mongoose");

const freeTipSchema = new mongoose.Schema({
  match: String,
  odds: String,
  prediction: String,
}, { timestamps: true });

module.exports = mongoose.model("FreeTip", freeTipSchema);
