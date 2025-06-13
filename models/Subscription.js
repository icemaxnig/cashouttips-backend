const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  telegramId: String,
  planType: String,
  amount: Number,
  startDate: Date,
  duration: Number // in days: 3, 5, or 7
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
