const express = require("express");
const router = express.Router();
const verifyAdmin = require("../../middleware/verifyAdmin");
const { handleRolloverUpload } = require("../../controllers/adminController");

// 🔐 Protected POST route for uploading rollover tip
router.post("/rollover-tip", verifyAdmin, handleRolloverUpload);

module.exports = router;
