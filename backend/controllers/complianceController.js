const store = require('../data/store');

// @desc    Get all safety certificates and audits
// @route   GET /api/compliance
const getAllCompliances = async (req, res) => {
  try {
    const list = await store.getCompliances(req.query);
    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch compliance certificates: ' + error.message });
  }
};

// @desc    Get compliance certificate by ID
// @route   GET /api/compliance/:id
const getComplianceById = async (req, res) => {
  try {
    const item = await store.getComplianceById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Compliance certificate not found.' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new certificate
// @route   POST /api/compliance
const createCompliance = async (req, res) => {
  try {
    const {
      certificateName, regulatoryBody, standardOrAct,
      issueDate, expiryDate, renewalWindowDays, inspectorOrAuditor,
      notes, complianceScore, status
    } = req.body;

    if (!certificateName || !regulatoryBody || !standardOrAct || !issueDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate name, regulatory body, standard/act, issue date, and expiry date are required.'
      });
    }

    // Auto-compute status based on expiryDate
    const now = new Date();
    const exp = new Date(expiryDate);
    const windowDays = Number(renewalWindowDays) || 60;
    const daysUntilExpiry = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    let computedStatus = status || 'Valid';
    if (daysUntilExpiry < 0) {
      computedStatus = 'Expired';
    } else if (daysUntilExpiry <= windowDays) {
      computedStatus = 'Expiring Soon';
    }

    const cert = await store.createCompliance({
      certificateName,
      regulatoryBody,
      standardOrAct,
      issueDate: new Date(issueDate),
      expiryDate: exp,
      renewalWindowDays: windowDays,
      status: computedStatus,
      inspectorOrAuditor: inspectorOrAuditor || '',
      notes: notes || '',
      complianceScore: complianceScore !== undefined ? Number(complianceScore) : 95
    });

    res.status(201).json({
      success: true,
      message: 'Compliance certificate registered successfully.',
      data: cert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding compliance record: ' + error.message });
  }
};

// @desc    Update compliance record or renew
// @route   PUT /api/compliance/:id
const updateCompliance = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.expiryDate) {
      const now = new Date();
      const exp = new Date(updateData.expiryDate);
      const windowDays = Number(updateData.renewalWindowDays) || 60;
      const daysUntilExpiry = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        updateData.status = 'Expired';
      } else if (daysUntilExpiry <= windowDays) {
        updateData.status = 'Expiring Soon';
      } else {
        updateData.status = 'Valid';
      }
    }

    const updated = await store.updateCompliance(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Compliance record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Compliance record updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating certificate: ' + error.message });
  }
};

// @desc    Delete compliance record
// @route   DELETE /api/compliance/:id
const deleteCompliance = async (req, res) => {
  try {
    const deleted = await store.deleteCompliance(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Compliance record not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Compliance record deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting record: ' + error.message });
  }
};

module.exports = {
  getAllCompliances,
  getComplianceById,
  createCompliance,
  updateCompliance,
  deleteCompliance
};
