const express = require('express');
const router = express.Router();
const {
  getAllCompliances,
  getComplianceById,
  createCompliance,
  updateCompliance,
  deleteCompliance
} = require('../controllers/complianceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllCompliances);
router.get('/:id', getComplianceById);
router.post('/', protect, createCompliance);
router.put('/:id', protect, updateCompliance);
router.delete('/:id', protect, deleteCompliance);

module.exports = router;
