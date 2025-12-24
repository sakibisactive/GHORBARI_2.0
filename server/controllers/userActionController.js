const User = require('../models/User');
const Story = require('../models/Story');
const FAQ = require('../models/FAQ'); // Ensure FAQ model exists
const MeetingRequest = require('../models/MeetingRequest');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
// --- SAVED SEARCHES ---
const saveSearch = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { name, filters } = req.body;
        user.savedSearches.push({ name, filters });
        await user.save();
        res.json({ message: 'Search Saved' });
    } catch(e) { res.status(500).json({message: 'Error'}); }
};

const getSavedSearches = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json(user.savedSearches);
};
const getSubscriptionPrice = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        // If they are new/user, default 1000. If premium, use their stored fee.
        const price = user.monthlyFee || 1000;
        res.json({ price });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching price' });
    }
};
// --- DELETION ---
const requestDeletion = async (req, res) => {
    const user = await User.findById(req.user._id);
    user.deletionRequested = true;
    await user.save();
    res.json({ message: 'Deletion requested' });
};

// --- STORIES (With Like/Comment) ---
const getStories = async (req, res) => {
    const stories = await Story.find({ status: 'approved' });
    res.json(stories);
};

const createStory = async (req, res) => {
    await Story.create({
        authorId: req.user._id,
        authorName: req.user.email,
        title: req.body.title,
        content: req.body.content
    });
    res.json({ message: 'Submitted' });
};

const likeStory = async (req, res) => {
    const story = await Story.findById(req.params.id);
    story.likes += 1;
    await story.save();
    res.json(story);
};

const commentStory = async (req, res) => {
    const story = await Story.findById(req.params.id);
    story.comments.push({ user: req.user.email, text: req.body.text });
    await story.save();
    res.json(story);
};

// --- UPGRADE ---
const submitUpgradeRequest = async (req, res) => {
    const { referralEmail } = req.body;
    const user = await User.findById(req.user._id);
    
    // CASE A: PREMIUM USER RENEWING
    if (user.role === 'premium') {
        // They pay whatever their stored monthlyFee is (e.g., 900)
        user.membershipStartDate = new Date(); // Reset their month
        // In real app, verify payment here
        await user.save();
        return res.json({ message: `Renewal Successful! You paid ${user.monthlyFee} TK.` });
    }

    // CASE B: NON-PREMIUM USER UPGRADING
    let finalPrice = 1000;

    if (referralEmail) {
        const referrer = await User.findOne({ email: referralEmail, role: 'premium' });
        
        if (referrer) {
            // 1. Give New User the Discount (One time or permanent? Assuming permanent for fairness)
            finalPrice = 950;
            user.monthlyFee = 950; 
            
            // 2. Give REFERRER the "Rest of Life" Discount
            // Example: Lower their fee by 100 TK (1000 -> 900)
            if (referrer.monthlyFee > 0) {
                referrer.monthlyFee = Math.max(0, referrer.monthlyFee - 100); // Reduce by 100, min 0
                await referrer.save();
                console.log(`[REWARD] ${referrer.email} fee reduced to ${referrer.monthlyFee}`);
            }

        } else {
            return res.status(400).json({ message: 'Invalid Referral Email (Must be Premium)' });
        }
    } else {
        // No referral
        user.monthlyFee = 1000;
    }

    // Process Payment...
    
    user.isVerificationRequested = true; 
    await user.save();

    res.json({ 
        message: `Payment of ${finalPrice} TK Successful! Request sent to Admin.`,
        discountApplied: finalPrice < 1000
    });
};

// --- FAQ & WISHLIST ---
const getFAQs = async (req, res) => { const f = await FAQ.find(); res.json(f); };
const askFAQ = async (req, res) => { await FAQ.create({userId: req.user._id, question: req.body.question}); res.json({msg: 'Sent'}); };
const answerFAQ = async (req, res) => {
    const { answer } = req.body;
    try {
        const faq = await FAQ.findById(req.params.id);
        if (faq) {
            faq.answer = answer;
            faq.isAnswered = true;
            await faq.save();
            res.json({ message: 'Reply sent' });
        } else {
            res.status(404).json({ message: 'FAQ not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error replying' });
    }
};
// @desc    Add or Remove property from Wishlist
const toggleWishlist = async (req, res) => {
    const { propertyId } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        // Check if property is already in the wishlist array
        if (user.wishlist.includes(propertyId)) {
            // REMOVE IT
            user.wishlist = user.wishlist.filter(id => id.toString() !== propertyId);
            await user.save();
            res.json({ message: 'Removed from Wishlist' });
        } else {
            // ADD IT
            user.wishlist.push(propertyId);
            await user.save();
            res.json({ message: 'Added to Wishlist' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 1. UPDATE: submitMeetingRequest
const submitMeetingRequest = async (req, res) => {
    const { propertyId } = req.body;
    try {
        const property = await Property.findById(propertyId);
        const owner = await User.findById(property.ownerId); // Fetch Owner Details

        // Generate Short ID (Last 6 chars of ID, uppercase)
        const shortId = property._id.toString().slice(-6).toUpperCase();

        // Check duplicates
        const existing = await MeetingRequest.findOne({ 
            requesterId: req.user._id, 
            propertyId: propertyId 
        });
        if (existing) return res.status(400).json({ message: 'Request already sent' });

        // A. Save FULL INFO for Admin
        await MeetingRequest.create({
            requesterId: req.user._id,
            requesterEmail: req.user.email,
            ownerId: property.ownerId,
            ownerEmail: owner.email, // <--- SAVING OWNER EMAIL FOR ADMIN
            propertyId: property._id,
            propertyTitle: `${property.type} in ${property.location}`,
            propertyCode: shortId
        });

        // B. Send Specific Notification to OWNER
        await Notification.create({
            userId: property.ownerId, 
            type: 'meeting',
            // Message now includes ID and Price to distinguish identical properties
            message: `Meeting Requested: ${property.type} in ${property.location}. [ID: ${shortId}] (Listed: ${property.price} TK). Check email for Admin details.`,
            link: `/property/${property._id}`
        });

        res.json({ message: 'Meeting request sent to Admin!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending request' });
    }
};

// 2. UPDATE: submitOffer
const submitOffer = async (req, res) => {
    const { propertyId, amount } = req.body;
    try {
        const property = await Property.findById(propertyId);
        
        // Generate Short ID
        const shortId = property._id.toString().slice(-6).toUpperCase();

        // Send Notification to OWNER with EXACT AMOUNT and ID
        await Notification.create({
            userId: property.ownerId,
            type: 'offer',
            // Specific Message:
            message: `New Offer: ${amount} TK for ${property.type} in ${property.location} [ID: ${shortId}].`,
            link: `/property/${property._id}`
        });

        res.json({ message: 'Offer sent to Owner!' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending offer' });
    }
};
const getNotifications = async (req, res) => {
    try {
        const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(notifs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// 3. ADD: Mark all as read
const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating' });
    }
};
module.exports = { 
    saveSearch, getSavedSearches, requestDeletion, 
    getStories, createStory, likeStory, commentStory,
    submitUpgradeRequest, getFAQs, askFAQ, answerFAQ, toggleWishlist,submitMeetingRequest,getSubscriptionPrice,getNotifications,    // <--- Add this
    markNotificationsRead,submitOffer
};