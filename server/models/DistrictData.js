const mongoose = require('mongoose');

const districtDataSchema = new mongoose.Schema({
  areaName: { type: String, required: true, unique: true }, // e.g., Dhanmondi
  crimeRate: { type: Number, required: true }, // Lower is better
  priceHistory: [{
    year: Number,
    avgPricePlot: Number,
    avgPriceApartment: Number,
    avgPriceBuilding: Number
  }]
});

module.exports = mongoose.model('DistrictData', districtDataSchema);
