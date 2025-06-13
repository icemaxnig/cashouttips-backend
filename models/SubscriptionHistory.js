const mongoose = require("mongoose");

const subscriptionHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  oddsPlan: String,
  days: Number,
  startDate: Date,
  endDate: Date
}, { timestamps: true });

module.exports = mongoose.model("SubscriptionHistory", subscriptionHistorySchema);