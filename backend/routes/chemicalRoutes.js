const express = require('express');
const router = express.Router();
const {
  getAllChemicals,
  getChemicalById,
  createChemical,
  updateChemical,
  deleteChemical
} = require('../controllers/chemicalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllChemicals);
router.get('/:id', getChemicalById);
router.post('/', protect, createChemical);
router.put('/:id', protect, updateChemical);
router.delete('/:id', protect, deleteChemical);

module.exports = router;
