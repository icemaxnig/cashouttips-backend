const express = require("express");
const router = express.Router();
const {
  createPlan,
  getPublicPlans,
  updatePlan,
  deletePlan
} = require("../../controllers/rolloverPlanController");

router.post("/rollover-plans", createPlan);
router.get("/rollover-plans", getPublicPlans); // fixed: corrected function
router.put("/rollover-plans/:id", updatePlan);
router.delete("/rollover-plans/:id", deletePlan);

module.exports = router;