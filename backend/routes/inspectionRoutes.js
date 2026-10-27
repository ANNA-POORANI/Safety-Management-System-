const express = require('express');
const router = express.Router();
const {
  getAllInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection
} = require('../controllers/inspectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllInspections);
router.get('/:id', getInspectionById);
router.post('/', protect, createInspection);
router.put('/:id', protect, updateInspection);
router.delete('/:id', protect, deleteInspection);

module.exports = router;
