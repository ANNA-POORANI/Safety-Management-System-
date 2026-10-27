const mongoose = require('mongoose');

const chemicalSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'chem_' + Date.now() },
  name: { type: String, required: true },
  formula: { type: String, required: true },
  casNumber: { type: String, required: true },
  hazardClass: {
    type: String,
    enum: ['Toxic Gas', 'Corrosive', 'Flammable Liquid', 'Oxidizer', 'Explosive', 'Carcinogen', 'Water-Reactive'],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  physicalState: {
    type: String,
    enum: ['Liquid', 'Gas', 'Solid', 'Slurry'],
    default: 'Liquid'
  },
  storageZone: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: {
    type: String,
    enum: ['Liters', 'Kilograms', 'Barrels', 'Tons', 'Cylinders'],
    default: 'Liters'
  },
  minThreshold: { type: Number, required: true, default: 100 },
  maxCapacity: { type: Number, required: true, default: 1000 },
  sdsDocumentUrl: { type: String, default: '' },
  ghsPictograms: [{ type: String }],
  lastInspectionDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Optimal', 'Low Stock', 'Over Capacity', 'Needs Inspection', 'Quarantined'],
    default: 'Optimal'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chemical', chemicalSchema);
