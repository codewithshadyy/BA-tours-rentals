

// models/booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  startDate: { type: Date },
  endDate: { type: Date },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  phone: { type: String },
  paymentMethod: { type: String, default: 'M-Pesa' },
  paymentStatus: { type: String, enum: ['Paid','Pending','Failed'], default: 'Pending' },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
