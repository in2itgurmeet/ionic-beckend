const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  company: String,
  password: String,

  role: { type: String, default: 'consigner' },
  status: { type: String, default: 'active' },

  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
