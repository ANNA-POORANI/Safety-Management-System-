const store = require('../data/store');
const { getDBStatus } = require('../config/db');

// @desc    Get dashboard metrics & summary
// @route   GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const stats = await store.getDashboardStats();
    const dbStatus = getDBStatus();

    res.status(200).json({
      success: true,
      dbStatus,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate dashboard metrics: ' + error.message });
  }
};

// @desc    Reset data to factory seed
// @route   POST /api/dashboard/reset
const resetDatabase = async (req, res) => {
  try {
    const result = await store.resetToSeed();
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset seed data: ' + error.message });
  }
};

module.exports = { getDashboard, resetDatabase };
