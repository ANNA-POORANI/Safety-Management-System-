const express = require('express');
const router = express.Router();
const { getDashboard, resetDatabase } = require('../controllers/dashboardController');

router.get('/', getDashboard);
router.post('/reset', resetDatabase);

module.exports = router;
