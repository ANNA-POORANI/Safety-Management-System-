const store = require('../data/store');

// @desc    Get all emergency response protocols
// @route   GET /api/emergency
const getAllProtocols = async (req, res) => {
  try {
    const protocols = await store.getEmergencyProtocols();
    res.status(200).json({
      success: true,
      count: protocols.length,
      data: protocols
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch emergency protocols: ' + error.message });
  }
};

// @desc    Get single protocol
// @route   GET /api/emergency/:id
const getProtocolById = async (req, res) => {
  try {
    const protocol = await store.getEmergencyProtocolById(req.params.id);
    if (!protocol) {
      return res.status(404).json({ success: false, message: 'Emergency protocol not found.' });
    }
    res.status(200).json({ success: true, data: protocol });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger emergency protocol (Activate siren/evacuation state)
// @route   POST /api/emergency/:id/trigger
const triggerEmergency = async (req, res) => {
  try {
    const activatedBy = req.user ? `${req.user.name} (${req.user.role})` : 'Safety Incident Commander';
    const updated = await store.toggleEmergencyProtocol(req.params.id, true, activatedBy);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Emergency protocol not found.' });
    }

    res.status(200).json({
      success: true,
      message: `🚨 EMERGENCY PROTOCOL ACTIVATED: ${updated.title}`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error triggering emergency protocol: ' + error.message });
  }
};

// @desc    Stand down / reset emergency protocol
// @route   POST /api/emergency/:id/standdown
const standDownEmergency = async (req, res) => {
  try {
    const updated = await store.toggleEmergencyProtocol(req.params.id, false);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Emergency protocol not found.' });
    }

    res.status(200).json({
      success: true,
      message: `✅ Emergency status cleared: ${updated.title} is now in STANDBY mode.`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating emergency state: ' + error.message });
  }
};

module.exports = {
  getAllProtocols,
  getProtocolById,
  triggerEmergency,
  standDownEmergency
};
