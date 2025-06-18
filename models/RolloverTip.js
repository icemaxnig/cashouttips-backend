const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  league: { type: String, required: true },
  teams: { type: String, required: true }, // e.g., "Team A vs Team B"
  time: { type: String, required: true },  // Could also be Date if preferred
  odds: { type: String, required: true },
  prediction: { type: String }, // Optional
});

const rolloverTipSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RolloverPlan",
    required: true,
  },
  games: {
    type: [gameSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0,
  },
  totalOdds: { type: Number, required: true },
  note: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.RolloverTip || mongoose.model("RolloverTip", rolloverTipSchema);
