  // cron/rolloverCleanup.js
const cron = require("node-cron");
const RolloverGame = require("../models/RolloverGame");

function startRolloverCleanupJob() {
  cron.schedule("0 1 * * *", async () => {
    try {
      const now = new Date();
      const result = await RolloverGame.deleteMany({ expiresAt: { $lt: now } });

      console.log(`🧹 Rollover cleanup: Deleted ${result.deletedCount} expired games.`);
    } catch (error) {
      console.error("❌ Rollover cleanup failed:", error);
    }
  });
}

module.exports = startRolloverCleanupJob;

