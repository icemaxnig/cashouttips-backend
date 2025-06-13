const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const {
  uploadRolloverTip,
  getTipForPlanDay
} = require("../controllers/rolloverTipController"); // ✅ Correct path and names

// ✅ Upload tip
router.post("/rollover-tip/upload", verifyToken, uploadRolloverTip);

// ✅ Fetch tip for a plan and day
router.get("/rollover-tip/:planId/:dayIndex", verifyToken, getTipForPlanDay);

module.exports = router;
