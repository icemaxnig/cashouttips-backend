// cot-backend/utils/loadSettings.js
const AdminSettings = require('../models/AdminSettings');

let settingsCache = null;

const loadSettings = async () => {
  if (!settingsCache) {
    const latest = await AdminSettings.findOne().sort({ updatedAt: -1 });
    settingsCache = latest || {};
  }
  return settingsCache;
};

const refreshSettings = async () => {
  const latest = await AdminSettings.findOne().sort({ updatedAt: -1 });
  settingsCache = latest || {};
};

module.exports = { loadSettings, refreshSettings };
