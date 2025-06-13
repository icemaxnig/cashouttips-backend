const mongoose = require("mongoose");
const RolloverPlan = require("../models/RolloverPlan");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedPlans = async () => {
  try {
    await RolloverPlan.deleteMany();

    const plans = [
      { name: "1.5 Odds – 3 Days", duration: 3, odds: 1.5, successRate: 98 },
      { name: "1.5 Odds – 5 Days", duration: 5, odds: 1.5, successRate: 95 },
      { name: "1.5 Odds – 7 Days", duration: 7, odds: 1.5, successRate: 90 },

      { name: "2 Odds – 3 Days", duration: 3, odds: 2.0, successRate: 95 },
      { name: "2 Odds – 5 Days", duration: 5, odds: 2.0, successRate: 89 },
      { name: "2 Odds – 7 Days", duration: 7, odds: 2.0, successRate: 80 },

      { name: "3 Odds – 3 Days", duration: 3, odds: 3.0, successRate: 90 },
      { name: "3 Odds – 5 Days", duration: 5, odds: 3.0, successRate: 82 },
      { name: "3 Odds – 7 Days", duration: 7, odds: 3.0, successRate: 76 },
    ];

    const enriched = plans.map(plan => ({
      ...plan,
      subscribers: Array.from({ length: Math.floor(Math.random() * 30) + 20 }), // simulate 20–50 subscribers
    }));

    await RolloverPlan.insertMany(enriched);

    console.log("✅ All 9 plans seeded with fake subscriber counts!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
};

seedPlans();
