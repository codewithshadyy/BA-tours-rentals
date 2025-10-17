

// backend/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  message: String,
  status: { type: String, enum: ['Open','In Progress','Closed'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
