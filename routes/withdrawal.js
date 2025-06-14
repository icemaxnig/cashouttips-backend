
const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/Withdrawal");

// Get all withdrawal requests
router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error("Fetch withdrawals error:", err);
    res.status(500).json({ message: "Failed to fetch withdrawals" });
  }
});

// Update status: paid or rejected
router.patch("/:id", async (req, res) => {
  const { status, reason } = req.body;
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    withdrawal.status = status;
    if (status === "rejected") {
      withdrawal.rejectionReason = reason || "Rejected by admin";
    }
    await withdrawal.save();

    res.json({ message: "Withdrawal updated", withdrawal });
  } catch (err) {
    console.error("Update withdrawal error:", err);
    res.status(500).json({ message: "Failed to update withdrawal" });
  }
});

module.exports = router;
