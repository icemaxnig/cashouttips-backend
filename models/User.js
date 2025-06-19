const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  telegramId: String,
  role: { type: String, default: "user" },
  isDeleted: { type: Boolean, default: false },
  isNewUser: { type: Boolean, default: true },
  
  // Wallet fields
  mainWallet: { type: Number, default: 0 },
  bonusWallet: { type: Number, default: 0 },
  
  // ✅ Store subscribed rollover plans
  rolloverPlans: [
    {
      plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RolloverPlan"
      },
      startDate: Date,
      duration: Number // duration in days
    }
  ],

  purchasedBookingCodes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "BookingCode" }
  ],

  isSubscribed: { type: Boolean, default: false },
  subscriptionStart: { type: Date },
  subscriptionExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
