const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requesterEmail: { type: String, required: true }, 
    
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerEmail: { type: String, required: true }, 
    
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyTitle: { type: String }, 
    propertyCode: { type: String }, 
    
    status: { type: String, default: 'pending' }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MeetingRequest', meetingSchema);