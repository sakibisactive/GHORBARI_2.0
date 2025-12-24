const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPriceAnalysis, getSuggestions, createPropertyAd,getPremiumProfile,
    updatePropertyPrice,togglePropertyStatus,
    getMyWishlist } = require('../controllers/premiumController');

// All routes require login
router.get('/analysis', protect, getPriceAnalysis);
router.get('/suggestion', protect, getSuggestions);
router.post('/advertise', protect, createPropertyAd);
router.get('/profile-stats', protect, getPremiumProfile);
router.put('/property/:id/price', protect, updatePropertyPrice);
router.get('/wishlist', protect, getMyWishlist);
router.put('/property/:id/status', protect, togglePropertyStatus);
module.exports = router;