const RolloverPlan = require("../models/RolloverPlan");

// Public plans for frontend
exports.getPublicPlans = async (req, res) => {
  try {
    const plans = await RolloverPlan.find({ price: { $gt: 0 }, duration: { $gt: 0 } }).sort({ createdAt: 1 });

    const enhanced = plans.map((plan, index) => {
      const createdAt = new Date(plan.createdAt).getTime();
      const ageMinutes = Math.floor((Date.now() - createdAt) / 60000);

      const offset = 100 + (index * 17);
      const fakeSubscribers = offset + Math.floor(ageMinutes * 1.5);

      return {
        ...plan.toObject(),
        fakeSubscribers,
      };
    });

    res.json(enhanced);
  } catch (err) {
    console.error("❌ Error fetching plans:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin creates a new plan
exports.createPlan = async (req, res) => {
  try {
    const newPlan = await RolloverPlan.create(req.body);
    res.status(201).json(newPlan);
  } catch (err) {
    console.error("❌ Failed to create plan:", err);
    res.status(400).json({ message: "Failed to create plan" });
  }
};

// Admin updates an existing plan
exports.updatePlan = async (req, res) => {
  try {
    const updated = await RolloverPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to update plan:", err);
    res.status(400).json({ message: "Update failed" });
  }
};

// Admin deletes a plan
exports.deletePlan = async (req, res) => {
  try {
    await RolloverPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted" });
  } catch (err) {
    console.error("❌ Failed to delete plan:", err);
    res.status(400).json({ message: "Delete failed" });
  }
};