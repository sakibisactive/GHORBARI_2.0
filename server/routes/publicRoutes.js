const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { searchProperties, getPropertyById, requestMeeting, getServiceProviders } = require('../controllers/publicController');

router.get('/search', protect, searchProperties);
router.get('/property/:id', protect, getPropertyById);
router.post('/meet', protect, requestMeeting);
router.get('/services', protect, getServiceProviders);

module.exports = router;