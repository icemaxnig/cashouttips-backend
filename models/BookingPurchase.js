const mongoose = require("mongoose");

const bookingPurchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookingCode",
      required: true,
    },
    price: Number,
    fromBonus: Number,
    fromMain: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingPurchase", bookingPurchaseSchema);
