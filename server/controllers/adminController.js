const User = require('../models/User');
const Property = require('../models/Property');
const Story = require('../models/Story');
const MeetingRequest = require('../models/MeetingRequest');
const AdminLog = require('../models/AdminLog');
const FAQ = require('../models/FAQ'); // Import at top
// @desc    Get users requesting verification
const getVerificationRequests = async (req, res) => {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
};

// @desc    Approve Premium Membership
const approveMembership = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.role = 'premium';
        user.membershipStartDate = new Date();
        await user.save();
        await AdminLog.create({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: 'Approved Premium Membership',
            targetId: user._id
        });
        res.json({ message: 'User upgraded to Premium' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get All Properties
const getAllProperties = async (req, res) => {
    try {
        // 1. Fetch properties and populate the 'ownerId' field to get the email
        const properties = await Property.find({}).populate('ownerId', 'email');

        // 2. Map through results to flatten the structure for the frontend
        // The frontend expects 'ownerEmail' at the top level, not inside an object.
        const formattedProperties = properties.map(p => {
            return {
                ...p._doc, // Spread the original property document
                ownerEmail: p.ownerId ? p.ownerId.email : "Unknown" // Extract email safely
            };
        });

        res.json(formattedProperties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching properties' });
    }
};

// @desc    Toggle Property Availability
const togglePropertyStatus = async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (property) {
        property.status = property.status === 'available' ? 'unavailable' : 'available';
        await property.save();
        await AdminLog.create({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: `Changed Property Status to ${property.status}`,
            targetId: property._id
        });
        res.json(property);
    } else {
        res.status(404).json({ message: 'Property not found' });
    }
};

// @desc    Get Pending Stories
const getPendingStories = async (req, res) => {
    const stories = await Story.find({ status: 'pending' });
    res.json(stories);
};

// @desc    Approve/Reject Story
const reviewStory = async (req, res) => {
    const { status } = req.body; 
    const story = await Story.findById(req.params.id);
    
    if (story) {
        if(status === 'rejected') {
            await story.deleteOne();
            res.json({ message: 'Story rejected and deleted' });
        } else {
            story.status = 'approved';
            await story.save();
            res.json({ message: 'Story Published' });
        }
    } else {
        res.status(404).json({ message: 'Story not found' });
    }
};

// @desc    Get Deletion Requests
const getDeletionRequests = async (req, res) => {
    const users = await User.find({ deletionRequested: true });
    res.json(users);
};

// @desc    Delete User
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};
const getMeetingRequests = async (req, res) => {
    try {
        const requests = await MeetingRequest.find({ status: 'pending' });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meetings' });
    }
};

const resolveMeetingRequest = async (req, res) => {
    try {
        const meeting = await MeetingRequest.findById(req.params.id);
        if (meeting) {
            meeting.status = 'connected';
            await meeting.save();
            res.json({ message: 'Marked as Connected' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
};
// @desc    Get all unanswered FAQs
const getPendingFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ answer: { $exists: false } }); // Find questions with no answer
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching FAQs' });
    }
};

// @desc    Reply to an FAQ
const replyToFAQ = async (req, res) => {
    const { answer } = req.body;
    try {
        const faq = await FAQ.findById(req.params.id);
        if (faq) {
            faq.answer = answer;
            await faq.save();
            res.json({ message: 'Reply sent' });
        } else {
            res.status(404).json({ message: 'FAQ not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error replying' });
    }
};

// Don't forget to add them to module.exports at the bottom!
module.exports = {
    getVerificationRequests,
    approveMembership,
    getAllProperties,
    togglePropertyStatus,
    getPendingStories,
    reviewStory,
    getDeletionRequests,
    deleteUser,
    getMeetingRequests,     // <--- ADD THIS
    resolveMeetingRequest,
    getPendingFAQs,
    replyToFAQ
};