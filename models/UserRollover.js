const mongoose = require("mongoose");

const userRolloverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RolloverPlan", // ✅ must match the actual model name
    required: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.UserRollover || mongoose.model("UserRollover", userRolloverSchema);
