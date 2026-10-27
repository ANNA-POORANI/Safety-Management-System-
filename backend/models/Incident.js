const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'inc_' + Date.now() },
  incidentCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  incidentType: {
    type: String,
    enum: ['Chemical Leak', 'Fire Outbreak', 'Toxic Vapor Release', 'Equipment Failure', 'Personnel Exposure', 'Spill', 'Fire Outbreak Risk'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Catastrophic'],
    default: 'Medium'
  },
  chemicalInvolved: { type: String, required: true },
  zone: { type: String, required: true },
  reportedBy: { type: String, required: true },
  reportDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Reported', 'Under Investigation', 'Contained', 'Resolved', 'Closed'],
    default: 'Reported'
  },
  casualties: { type: Number, default: 0 },
  immediateAction: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  containmentDuration: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', incidentSchema);
