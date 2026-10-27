const express = require('express');
const router = express.Router();
const {
  getAllProtocols,
  getProtocolById,
  triggerEmergency,
  standDownEmergency
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllProtocols);
router.get('/:id', getProtocolById);
router.post('/:id/trigger', protect, triggerEmergency);
router.post('/:id/standdown', protect, standDownEmergency);

module.exports = router;
