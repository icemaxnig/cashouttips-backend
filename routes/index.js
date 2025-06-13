const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/rollover', require('./rollover'));
router.use('/free', require('./freeTip'));
router.use('/booking', require('./booking'));

module.exports = router;
