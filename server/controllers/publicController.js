const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');

// @desc    Search & Filter Properties
const searchProperties = async (req, res) => {
    try {
        const { type, searchType, location, priceSort, dateSort } = req.query;

        // 1. Basic Filters
        let query = { status: 'available' };

        // 2. FILTER OUT OWN PROPERTIES
        // If the user is logged in, do not show properties they own
        if (req.user) {
            query.ownerId = { $ne: req.user._id };
        }

        if (type) query.type = type;
        if (searchType) query.searchType = searchType;
        if (location) query.location = location;

        // 3. Sorting
        let sort = {};
        if (priceSort === 'low-high') sort.price = 1;
        if (priceSort === 'high-low') sort.price = -1;
        if (dateSort === 'new-old') sort.createdAt = -1;
        if (dateSort === 'old-new') sort.createdAt = 1;
        
        const properties = await Property.find(query).sort(sort);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Single Property Details
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('ownerId', 'email');
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Request Meeting (Premium Only)
const requestMeeting = async (req, res) => {
    const { propertyId, ownerId } = req.body;
    console.log(`[EMAIL SENT] To Admin: User ${req.user.email} wants to meet Owner of Prop ${propertyId}`);
    res.json({ message: 'Meeting request sent to Admin. Check your email for owner details.' });
};

// @desc    Get Service Providers
const getServiceProviders = async (req, res) => {
    const { category } = req.query; 
    try {
        const providers = await ServiceProvider.find({ category });
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { searchProperties, getPropertyById, requestMeeting, getServiceProviders };