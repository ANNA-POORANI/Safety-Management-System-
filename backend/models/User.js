const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'usr_' + Date.now() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Safety Manager', 'Plant Operator', 'Compliance Officer', 'Admin'],
    default: 'Plant Operator'
  },
  shift: {
    type: String,
    enum: ['Morning Shift (A)', 'Evening Shift (B)', 'Night Shift (C)'],
    default: 'Morning Shift (A)'
  },
  department: { type: String, default: 'Chemical Operations' },
  phone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
