
const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  values: {
    type: Object,
    default: {},
  },
  allowMultipleRolloverPosts: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("Settings", SettingsSchema);
