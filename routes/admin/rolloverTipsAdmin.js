// 📁 routes/admin/rolloverTipsAdmin.js

const express = require("express");
const router = express.Router();
const controller = require("../../controllers/adminRolloverTipController");
const { verifyToken, isAdmin } = require("../../middleware/authMiddleware");

// ✅ Admin-only routes
router.post("/rollover-tip", verifyToken, isAdmin, controller.uploadTip);
router.get("/rollover-tips", verifyToken, isAdmin, controller.getAllTips);
router.put("/rollover-tip/:id", verifyToken, isAdmin, controller.updateTip);
router.delete("/rollover-tip/:id", verifyToken, isAdmin, controller.deleteTip);

module.exports = router;
