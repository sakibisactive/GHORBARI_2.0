const mongoose = require('mongoose');

const landmarkSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['school', 'market', 'hospital'] },
  location: String,
  rating: Number
});

module.exports = mongoose.model('Landmark', landmarkSchema);