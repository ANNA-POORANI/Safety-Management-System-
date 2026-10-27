const store = require('../data/store');

// @desc    Get all incident reports
// @route   GET /api/incidents
const getAllIncidents = async (req, res) => {
  try {
    const incidents = await store.getIncidents(req.query);
    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch incidents: ' + error.message });
  }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
const getIncidentById = async (req, res) => {
  try {
    const incident = await store.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident report not found.' });
    }
    res.status(200).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report new safety incident
// @route   POST /api/incidents
const createIncident = async (req, res) => {
  try {
    const {
      title, incidentType, severity, chemicalInvolved, zone,
      reportedBy, reportDate, casualties, immediateAction, rootCause, status
    } = req.body;

    if (!title || !incidentType || !chemicalInvolved || !zone) {
      return res.status(400).json({
        success: false,
        message: 'Title, incident type, chemical involved, and zone are required fields.'
      });
    }

    const incident = await store.createIncident({
      title,
      incidentType,
      severity: severity || 'Medium',
      chemicalInvolved,
      zone,
      reportedBy: reportedBy || (req.user ? req.user.name : 'Plant Personnel'),
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      status: status || 'Reported',
      casualties: Number(casualties) || 0,
      immediateAction: immediateAction || '',
      rootCause: rootCause || '',
      containmentDuration: req.body.containmentDuration || 'Pending investigation'
    });

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully.',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting incident report: ' + error.message });
  }
};

// @desc    Update incident report
// @route   PUT /api/incidents/:id
const updateIncident = async (req, res) => {
  try {
    const updated = await store.updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Incident report not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Incident report updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating incident: ' + error.message });
  }
};

// @desc    Delete incident report
// @route   DELETE /api/incidents/:id
const deleteIncident = async (req, res) => {
  try {
    const deleted = await store.deleteIncident(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Incident not found to delete.' });
    }
    res.status(200).json({
      success: true,
      message: 'Incident report deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting incident: ' + error.message });
  }
};

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
};
