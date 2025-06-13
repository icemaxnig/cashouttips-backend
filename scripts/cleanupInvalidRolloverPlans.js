
// 📁 scripts/cleanupInvalidRolloverPlans.js

require("dotenv").config();
const mongoose = require("mongoose");
const RolloverPlan = require("../models/RolloverPlan");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const invalidPlans = await RolloverPlan.find({
      $or: [
        { price: { $exists: false } },
        { price: { $lte: 0 } },
        { duration: { $exists: false } },
        { duration: { $lte: 0 } }
      ]
    });

    if (invalidPlans.length === 0) {
      console.log("✅ No invalid rollover plans found.");
      process.exit(0);
    }

    console.log(`🧹 Found ${invalidPlans.length} invalid rollover plans. Deleting...`);
    const ids = invalidPlans.map(p => p._id);
    await RolloverPlan.deleteMany({ _id: { $in: ids } });

    console.log("✅ Invalid plans deleted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error cleaning up plans:", err.message);
    process.exit(1);
  }
})();
