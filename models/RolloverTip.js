const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  league: { type: String, required: true },
  teams: { type: String }, // e.g., "Team A vs Team B"
  teamA: { type: String }, // Individual team names for better compatibility
  teamB: { type: String },
  kickoff: { type: String, required: true },  // Game time
  odds: { type: String, required: true },
  bookmaker: { type: String, required: true },
  bookingCode: { type: String, required: true },
  prediction: { type: String }, // Optional
});

const rolloverTipSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RolloverPlan",
    required: true,
  },
  dayIndex: { type: Number, required: true }, // Day number in the rollover sequence
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
