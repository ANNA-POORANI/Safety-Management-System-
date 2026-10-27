const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'comp_' + Date.now() },
  certCode: { type: String, required: true, unique: true },
  certificateName: { type: String, required: true },
  regulatoryBody: {
    type: String,
    required: true
  },
  standardOrAct: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  renewalWindowDays: { type: Number, default: 60 },
  status: {
    type: String,
    enum: ['Valid', 'Expiring Soon', 'Expired', 'Under Audit'],
    default: 'Valid'
  },
  inspectorOrAuditor: { type: String, default: '' },
  notes: { type: String, default: '' },
  complianceScore: { type: Number, min: 0, max: 100, default: 95 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Compliance', complianceSchema);
