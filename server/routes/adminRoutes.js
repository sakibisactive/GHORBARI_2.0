const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Import ALL functions from the controller
const { 
    getVerificationRequests, 
    approveMembership, 
    getAllProperties, 
    togglePropertyStatus,
    getPendingStories,
    reviewStory,
    getDeletionRequests, 
    deleteUser
} = require('../controllers/adminController');

// Verification Routes
router.get('/verification', protect, adminOnly, getVerificationRequests);
router.put('/verify/:id', protect, adminOnly, approveMembership);

// Property Routes
router.get('/properties', protect, adminOnly, getAllProperties);
router.put('/property-status/:id', protect, adminOnly, togglePropertyStatus);

// Story Routes
router.get('/stories', protect, adminOnly, getPendingStories);
router.put('/story-review/:id', protect, adminOnly, reviewStory);

// Deletion Routes (The ones that were causing the crash)
router.get('/deletion-requests', protect, adminOnly, getDeletionRequests);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;