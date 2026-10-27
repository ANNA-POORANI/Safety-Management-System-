const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'insp_' + Date.now() },
  inspectionCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  inspectionType: {
    type: String,
    enum: ['Routine Safety', 'High-Hazard Audit', 'Pre-Startup Review', 'Environmental Compliance', 'Emergency Equipment', 'Equipment Integrity'],
    required: true
  },
  zone: { type: String, required: true },
  inspectorName: { type: String, required: true },
  inspectorRole: { type: String, default: 'Safety Inspector' },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date, default: null },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Failed', 'Overdue'],
    default: 'Pending'
  },
  riskScore: { type: Number, min: 0, max: 100, default: 50 },
  findings: { type: String, default: '' },
  actionItems: [{ type: String }],
  passed: { type: Boolean, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inspection', inspectionSchema);
