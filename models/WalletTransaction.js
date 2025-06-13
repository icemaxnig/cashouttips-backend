// 📁 models/WalletTransaction.js
const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  wallet: { type: String, enum: ["main", "bonus"], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
