const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, default: "admin" }
}, { timestamps: true });

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
