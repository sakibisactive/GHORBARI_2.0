const Property = require('../models/Property');
const User = require('../models/User');
const DistrictData = require('../models/DistrictData');

// @desc    Get Premium Profile Stats & Owned Properties
const getPremiumProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const properties = await Property.find({ ownerId: userId });
        
        const total = properties.length;
        const rentCount = properties.filter(p => p.searchType === 'rent').length;
        const sellCount = properties.filter(p => p.searchType === 'sell').length;

        res.json({
            stats: { total, rentCount, sellCount },
            properties 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Property Price
const updatePropertyPrice = async (req, res) => {
    const { id } = req.params;
    const { newPrice } = req.body;

    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ message: 'Property not found' });
        
        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const oldPrice = property.price;
        property.price = newPrice;
        await property.save();

        console.log(`[NOTIFICATION] Price Alert! Property ${id} changed from ${oldPrice} to ${newPrice}.`);

        res.json({ message: 'Price Updated', property });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Full Wishlist
const getMyWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        const wishlist = user.wishlist;
        
        const forRent = wishlist.filter(p => p.searchType === 'rent');
        const forSell = wishlist.filter(p => p.searchType === 'sell');

        res.json({ forRent, forSell });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Price Analysis
const getPriceAnalysis = async (req, res) => {
    const { area } = req.query;
    try {
        const data = await DistrictData.findOne({ areaName: area });
        if (!data) return res.status(404).json({ message: 'No data found for this area' });
        res.json(data.priceHistory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Suggestions (Filtered: No Own Properties)
const getSuggestions = async (req, res) => {
    try {
        // FILTER: Status available AND Owner is NOT current user
        const properties = await Property.find({ 
            status: 'available',
            ownerId: { $ne: req.user._id } // <--- Added this line
        });
        
        if (properties.length === 0) return res.json([]);

        const districts = await DistrictData.find({});
        const districtMap = {};
        districts.forEach(d => districtMap[d.areaName] = d.crimeRate);

        const scoredProperties = properties.map(prop => {
            const crimeRate = districtMap[prop.location] || 50;
            const distHospital = (Math.random() * 10).toFixed(1);
            const distSchool = (Math.random() * 10).toFixed(1);
            const distMarket = (Math.random() * 10).toFixed(1);

            const score = (crimeRate * 1000000) + (Number(distHospital) * 10000) + (Number(distSchool) * 100) + Number(distMarket);

            return { 
                ...prop._doc, 
                crimeRate, distHospital, distSchool, distMarket, score 
            };
        });

        scoredProperties.sort((a, b) => a.score - b.score);
        res.json(scoredProperties);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create Ad
const createPropertyAd = async (req, res) => {
    try {
        const newProperty = await Property.create({
            ownerId: req.user._id,
            ...req.body,
            contactEmail: req.user.email,
            status: 'pending'
        });
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(400).json({ message: 'Invalid Data' });
    }
};
// @desc    Toggle Property Status (Available <-> Unavailable)
const togglePropertyStatus = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) return res.status(404).json({ message: 'Property not found' });

        // Security Check: Ensure the requester is the OWNER
        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Toggle Logic
        if (property.status === 'available') {
            property.status = 'unavailable';
        } else if (property.status === 'unavailable') {
            property.status = 'available';
        }
        // Note: We don't touch 'pending' status here.

        await property.save();
        res.json({ message: `Property is now ${property.status}`, status: property.status });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add to module.exports at the bottom:
// module.exports = { ..., togglePropertyStatus };
module.exports = { 
    getPremiumProfile, updatePropertyPrice, getMyWishlist,
    getPriceAnalysis, getSuggestions, createPropertyAd ,togglePropertyStatus
};