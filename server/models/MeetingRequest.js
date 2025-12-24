const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requesterEmail: { type: String, required: true }, // Admin needs this
    
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerEmail: { type: String, required: true }, // <--- NEW: Admin needs this too
    
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyTitle: { type: String }, 
    propertyCode: { type: String }, // <--- NEW: Short ID (e.g., '9F2A1C') for reference
    
    status: { type: String, default: 'pending' }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MeetingRequest', meetingSchema);