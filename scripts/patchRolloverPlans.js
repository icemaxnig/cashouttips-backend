
// 📁 scripts/patchRolloverPlans.js

const mongoose = require("mongoose");
require("dotenv").config();
const RolloverPlan = require("../models/RolloverPlan");

async function patchPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const result = await RolloverPlan.updateMany(
      { duration: { $exists: false } },
      { $set: { duration: 3 } } // ✅ Set default duration here (e.g., 3 days)
    );

    console.log(`✅ ${result.modifiedCount} rollover plans updated with default duration.`);
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Failed to patch rollover plans:", error);
  }
}

patchPlans();
