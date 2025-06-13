// 📁 controllers/adminRolloverTipController.js

const RolloverTip = require("../../models/RolloverTip");
const RolloverPlan = require("../../models/RolloverPlan");

// ✅ Upload a new Rollover Tip
exports.uploadTip = async (req, res) => {
  try {
    const { planId, games, totalOdds, note, expiresAt } = req.body;

    if (!planId || !games || !totalOdds || !expiresAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate plan
    const plan = await RolloverPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Invalid plan selected" });

    // ✅ Restrict one tip per plan per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await RolloverTip.findOne({
      plan: planId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      return res.status(400).json({ message: "Tip already uploaded for this plan today" });
    }

    // ✅ Create tip
    const tip = new RolloverTip({
      plan: planId,
      games,
      totalOdds,
      note,
      dayIndex: 0, // will be computed per user when viewing
      expiresAt
    });

    await tip.save();
    res.status(201).json({ message: "Rollover tip uploaded successfully" });
  } catch (err) {
    console.error("❌ Failed to upload tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all tips (admin view)
exports.getAllTips = async (req, res) => {
  try {
    const tips = await RolloverTip.find().populate("plan", "name odds duration").sort({ createdAt: -1 });
    res.json(tips);
  } catch (err) {
    console.error("❌ Failed to fetch tips:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update a tip
exports.updateTip = async (req, res) => {
  try {
    const tipId = req.params.id;
    const { games, totalOdds, note, expiresAt } = req.body;

    const updated = await RolloverTip.findByIdAndUpdate(
      tipId,
      { games, totalOdds, note, expiresAt },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Tip not found" });

    res.json({ message: "Rollover tip updated" });
  } catch (err) {
    console.error("❌ Failed to update tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a tip
exports.deleteTip = async (req, res) => {
  try {
    const tipId = req.params.id;
    const deleted = await RolloverTip.findByIdAndDelete(tipId);
    if (!deleted) return res.status(404).json({ message: "Tip not found" });
    res.json({ message: "Rollover tip deleted" });
  } catch (err) {
    console.error("❌ Failed to delete tip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

