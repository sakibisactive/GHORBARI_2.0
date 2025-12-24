const express = require('express');
const router = express.Router();
// You need to create middleware/authMiddleware.js first (from previous chat)
const { protect } = require('../middleware/authMiddleware'); 
const { 
    saveSearch, getSavedSearches, requestDeletion,
    getStories, createStory, likeStory, commentStory,
    getFAQs, askFAQ, toggleWishlist, submitUpgradeRequest, submitMeetingRequest,
    answerFAQ,getSubscriptionPrice,getNotifications, 
    markNotificationsRead,submitOffer
} = require('../controllers/userActionController');

router.post('/save-search', protect, saveSearch);
router.get('/save-search', protect, getSavedSearches);
router.put('/delete-request', protect, requestDeletion);
router.get('/stories', protect, getStories);
router.post('/stories', protect, createStory);
router.put('/story/:id/like', protect, likeStory);
router.post('/story/:id/comment', protect, commentStory);
router.get('/faq', protect, getFAQs);
router.post('/faq', protect, askFAQ);
router.post('/wishlist', protect, toggleWishlist);
router.post('/upgrade', protect, submitUpgradeRequest);
router.post('/meet-request', protect, submitMeetingRequest); // For Meeting
router.put('/faq/:id', protect, answerFAQ); // For FAQ Reply
router.get('/subscription-price', protect, getSubscriptionPrice);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.post('/offer', protect, submitOffer);
module.exports = router;