const ActivityLog = require("../models/ActivityLog");

async function logActivity({ userId, type, description }) {
  try {
    await ActivityLog.create({ userId, type, description });
  } catch (err) {
    // Log to console but do not throw, to avoid breaking main flow
    console.error("[ActivityLog] Failed to log activity:", err);
  }
}

module.exports = logActivity; 