const express = require("express");
const router = express.Router();
const {
  createPlan,
  getPublicPlans,
  updatePlan,
  deletePlan
} = require("../../controllers/rolloverPlanController");
const verifyToken = require("../../middleware/verifyToken");
const checkRole = require("../../middleware/roleMiddleware");
const verifyAdminToken = [verifyToken, checkRole("admin")];

// Admin routes for rollover plans
router.post("/", verifyAdminToken, createPlan);
router.get("/", verifyAdminToken, getPublicPlans);
router.put("/:id", verifyAdminToken, updatePlan);
router.delete("/:id", verifyAdminToken, deletePlan);

module.exports = router;