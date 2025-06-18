const mongoose = require("mongoose");

const RolloverPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in days
    required: true,
  },
  odds: {
    type: Number, // daily odds
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 1000,
  },
  successRate: {
    type: Number,
    default: null,
  },
  postLimit: {
    type: Number,
    default: 1,
    min: 1,
  },
  subscribers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // 👇 New fields (non-breaking additions)
  fakeStart: {
    type: Number,
    default: 200, // example: starts from 200 fake users
  },
  growthRatePerHour: {
    type: Number,
    default: 10, // example: grows by 10 fake users per hour
  },

}, { timestamps: true });

module.exports = mongoose.models.RolloverPlan || mongoose.model("RolloverPlan", RolloverPlanSchema);
