const mongoose = require('mongoose');

const emergencyProtocolSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'ep_' + Date.now() },
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Gas Release', 'Chemical Spill', 'Fire & Explosion', 'Runaway Reaction', 'Power Failure'],
    required: true
  },
  alertLevel: {
    type: String,
    enum: ['Normal', 'Level 1 - Internal Alert', 'Level 2 - Plant Evacuation', 'Level 3 - Off-Site Emergency'],
    default: 'Level 1 - Internal Alert'
  },
  triggerConditions: { type: String, required: true },
  steps: [
    {
      stepNumber: { type: Number, required: true },
      action: { type: String, required: true },
      assignedRole: { type: String, required: true },
      isCrucial: { type: Boolean, default: false }
    }
  ],
  musterPoints: [{ type: String }],
  emergencyContacts: [
    {
      role: { type: String, required: true },
      name: { type: String, required: true },
      phone: { type: String, required: true }
    }
  ],
  isActive: { type: Boolean, default: false },
  activatedAt: { type: Date, default: null },
  activatedBy: { type: String, default: null }
});

module.exports = mongoose.model('EmergencyProtocol', emergencyProtocolSchema);
