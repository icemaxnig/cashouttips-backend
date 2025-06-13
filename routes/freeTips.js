const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/freeTipController");

router.post("/", ctrl.createFreeTip);
router.get("/", ctrl.getFreeTipPreview);

module.exports = router;
