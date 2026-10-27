const store = require('../data/store');

// @desc    Get all safety inspections
// @route   GET /api/inspections
const getAllInspections = async (req, res) => {
  try {
    const inspections = await store.getInspections(req.query);
    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch inspections: ' + error.message });
  }
};

// @desc    Get single inspection
// @route   GET /api/inspections/:id
const getInspectionById = async (req, res) => {
  try {
    const inspection = await store.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found.' });
    }
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Schedule new inspection
// @route   POST /api/inspections
const createInspection = async (req, res) => {
  try {
    const {
      title, inspectionType, zone, inspectorName, inspectorRole,
      scheduledDate, riskScore, findings, actionItems, status, passed
    } = req.body;

    if (!title || !inspectionType || !zone || !inspectorName || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, zone, inspector name, and scheduled date are required.'
      });
    }

    const inspection = await store.createInspection({
      title,
      inspectionType,
      zone,
      inspectorName,
      inspectorRole: inspectorRole || (req.user ? req.user.role : 'Safety Inspector'),
      scheduledDate: new Date(scheduledDate),
      status: status || 'Pending',
      riskScore: riskScore !== undefined ? Number(riskScore) : 50,
      findings: findings || '',
      actionItems: actionItems || [],
      passed: passed !== undefined ? passed : null
    });

    res.status(201).json({
      success: true,
      message: 'Inspection scheduled successfully.',
      data: inspection
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error scheduling inspection: ' + error.message });
  }
};

// @desc    Update inspection (e.g. mark completed, findings, pass/fail)
// @route   PUT /api/inspections/:id
const updateInspection = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.status === 'Completed' && !updateData.completedDate) {
      updateData.completedDate = new Date();
    }

    const updated = await store.updateInspection(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inspection record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Inspection updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating inspection: ' + error.message });
  }
};

// @desc    Delete inspection
// @route   DELETE /api/inspections/:id
const deleteInspection = async (req, res) => {
  try {
    const deleted = await store.deleteInspection(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inspection not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Inspection deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting inspection: ' + error.message });
  }
};

module.exports = {
  getAllInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection
};
