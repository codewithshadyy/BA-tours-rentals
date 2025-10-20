

// backend/models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String, 
  price: Number,
  images: [String],
  type: { type: String, enum: ['Guided Tour', 'Water Sport '], required: true },

   slots: { type: Number, default: 5 }, 
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
