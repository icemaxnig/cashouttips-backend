// models/Wallet.js

const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 }, // ✅ Added field for bonus wallet
  transactions: [
    {
      type: {
        type: String,
        enum: ["fund", "spend", "credit", "debit"],
      },
      amount: Number,
      reason: String,
      method: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Wallet", walletSchema);
