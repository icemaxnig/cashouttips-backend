// controllers/rolloverTipsController.js
const RolloverTip = require("../models/RolloverTip");
const RolloverPlan = require("../models/RolloverPlan");

// ✅ Upload daily tip for a plan
exports.uploadRolloverTip = async (req, res) => {
  const { planId, dayIndex, games, totalOdds, note, expiresAt } = req.body;

  if (!planId || !games?.length || !totalOdds || !expiresAt) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const plan = await RolloverPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // ✅ Limit: one tip per plan per day
    const existingTip = await RolloverTip.findOne({ plan: planId, dayIndex });
    if (existingTip) {
      return res.status(400).json({ message: `Tip already exists for Day ${dayIndex}` });
    }

    const tip = new RolloverTip({
      plan: planId,
      dayIndex,
      games,
      totalOdds,
      note,
      expiresAt,
    });

    await tip.save();
    return res.status(201).json({ message: "Tip uploaded successfully" });
  } catch (err) {
    console.error("❌ Error uploading tip:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Public: fetch tips by plan and day (used in viewer)
exports.getTipForPlanDay = async (req, res) => {
  const { planId, dayIndex } = req.params;
  try {
    const tip = await RolloverTip.findOne({ plan: planId, dayIndex });
    if (!tip) return res.status(404).json({ message: "No tip found" });
    return res.json(tip);
  } catch (err) {
    console.error("❌ Error fetching tip:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
