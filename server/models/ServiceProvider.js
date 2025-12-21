const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  category: { type: String, enum: ['developer', 'interior', 'technician'], required: true },
  subCategory: { type: String }, // e.g., plumber, electrician (only for technician)
  name: String,
  contactInfo: String,
  officeLocation: String,
  // Stats
  projectsCompleted: Number, // buildings made, flats designed, or works done
}, { timestamps: true });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
