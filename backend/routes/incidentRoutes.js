const express = require('express');
const router = express.Router();
const {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
} = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllIncidents);
router.get('/:id', getIncidentById);
router.post('/', protect, createIncident);
router.put('/:id', protect, updateIncident);
router.delete('/:id', protect, deleteIncident);

module.exports = router;
