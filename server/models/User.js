const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'premium', 'user'], default: 'user' },
  savedSearches: [{
    name: String,
    filters: Object,
    savedAt: { type: Date, default: Date.now }
  }],
  // Other fields optional for this quick setup, sticking to essentials
  membershipStartDate: { type: Date },
  isVerificationRequested: { type: Boolean, default: false },
  deletionRequested: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);