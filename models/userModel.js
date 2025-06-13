const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    referralCode: { type: String, default: "" },
    referredBy: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Fix: only define model if it doesn't exist already
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
