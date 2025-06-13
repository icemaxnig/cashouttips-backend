const mongoose = require("mongoose");

const userLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  email: String,
  action: { type: String, enum: ["register", "login", "reset"], required: true },
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserLog", userLogSchema);
