// models/RolloverSubscription.js
const mongoose = require("mongoose");

const rolloverSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planType: { type: String, required: true }, // e.g., "2.0-5"
  amount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  referralEarning: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.RolloverSubscription || mongoose.model("RolloverSubscription", rolloverSubscriptionSchema);
