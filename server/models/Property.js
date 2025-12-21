const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['plot', 'apartment', 'building'], required: true },
  searchType: { type: String, enum: ['sell', 'rent'], required: true },
  location: { type: String, required: true }, // e.g., Mirpur, Uttara
  price: { type: Number, required: true },
  details: {
    size: Number, // sq ft
    floor: Number, // for building/apartment
    description: String
  },
  contactEmail: { type: String },
  images: [String], // URLs to images
  view360Url: { type: String }, // URL for 360 view
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'unavailable', 'pending'], default: 'pending' }, // pending until admin approves
  // Coordinates for Suggestion Algorithm
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
