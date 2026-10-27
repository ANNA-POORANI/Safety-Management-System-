const store = require('../data/store');

// @desc    Get all chemicals with optional search and filters
// @route   GET /api/chemicals
const getAllChemicals = async (req, res) => {
  try {
    const chemicals = await store.getChemicals(req.query);
    res.status(200).json({
      success: true,
      count: chemicals.length,
      data: chemicals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chemical inventory: ' + error.message });
  }
};

// @desc    Get single chemical by ID
// @route   GET /api/chemicals/:id
const getChemicalById = async (req, res) => {
  try {
    const chemical = await store.getChemicalById(req.params.id);
    if (!chemical) {
      return res.status(404).json({ success: false, message: 'Chemical record not found.' });
    }
    res.status(200).json({ success: true, data: chemical });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new chemical
// @route   POST /api/chemicals
const createChemical = async (req, res) => {
  try {
    const {
      name, formula, casNumber, hazardClass, riskLevel,
      physicalState, storageZone, quantity, unit, minThreshold,
      maxCapacity, sdsDocumentUrl, ghsPictograms, notes, status
    } = req.body;

    if (!name || !formula || !casNumber || !hazardClass || !storageZone || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, formula, CAS number, hazard class, storage zone, and quantity are required.'
      });
    }

    // Determine status automatically if not provided
    let calculatedStatus = status || 'Optimal';
    const numQty = Number(quantity);
    const numMin = Number(minThreshold || 100);
    const numMax = Number(maxCapacity || 1000);

    if (numQty < numMin) {
      calculatedStatus = 'Low Stock';
    } else if (numQty > numMax) {
      calculatedStatus = 'Over Capacity';
    }

    const chemical = await store.createChemical({
      name,
      formula,
      casNumber,
      hazardClass,
      riskLevel: riskLevel || 'Medium',
      physicalState: physicalState || 'Liquid',
      storageZone,
      quantity: numQty,
      unit: unit || 'Liters',
      minThreshold: numMin,
      maxCapacity: numMax,
      sdsDocumentUrl: sdsDocumentUrl || '',
      ghsPictograms: ghsPictograms || [],
      notes: notes || '',
      status: calculatedStatus
    });

    res.status(201).json({
      success: true,
      message: 'Chemical record successfully created.',
      data: chemical
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding chemical: ' + error.message });
  }
};

// @desc    Update chemical
// @route   PUT /api/chemicals/:id
const updateChemical = async (req, res) => {
  try {
    const updated = await store.updateChemical(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Chemical record not found to update.' });
    }
    res.status(200).json({
      success: true,
      message: 'Chemical updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating chemical: ' + error.message });
  }
};

// @desc    Delete chemical
// @route   DELETE /api/chemicals/:id
const deleteChemical = async (req, res) => {
  try {
    const deleted = await store.deleteChemical(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Chemical record not found to delete.' });
    }
    res.status(200).json({
      success: true,
      message: `Chemical '${deleted.name}' deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting chemical: ' + error.message });
  }
};

module.exports = {
  getAllChemicals,
  getChemicalById,
  createChemical,
  updateChemical,
  deleteChemical
};
