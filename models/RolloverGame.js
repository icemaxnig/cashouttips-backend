// models/RolloverGame.js

const mongoose = require("mongoose");

const RolloverGameSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RolloverPlan",
    required: true,
  },
  games: [
    {
      league: String,
      teams: String,
      time: String,
    },
  ],
  totalOdds: {
    type: String,
    required: true,
  },
  bookingCode: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("RolloverGame", RolloverGameSchema);
