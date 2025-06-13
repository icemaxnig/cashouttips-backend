const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: { type: String, default: 'info' } // e.g., 'info', 'alert', 'tip'
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
