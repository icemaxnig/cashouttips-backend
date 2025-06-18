const mongoose = require('mongoose');

const postLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['FREE_TIP', 'ROLLOVER', 'BOOKING'] },
  contentId: String,
  postedToTelegram: Boolean,
  postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.PostLog || mongoose.model('PostLog', postLogSchema);
