const User = require('../models/User');
const Story = require('../models/Story');
const FAQ = require('../models/FAQ'); // Ensure FAQ model exists

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
    
    let discount = false;
    let finalPrice = 1000;

    // 1. Check Referral
    if (referralEmail) {
        const referrer = await User.findOne({ email: referralEmail, role: 'premium' });
        if (referrer) {
            user.referralUsed = referralEmail;
            discount = true;
            finalPrice = 950;
            // Simulate notifying the referrer
            console.log(`[NOTIFICATION] To ${referrer.email}: User ${user.email} used your referral code!`);
        } else {
            return res.status(400).json({ message: 'Invalid Referral Email or User is not Premium' });
        }
    }

    // 2. Process "Fake" Payment
    // In a real app, you would integrate Stripe/BKash API here.
    // For this demo, we assume payment is successful immediately upon clicking "Confirm".
    
    // 3. Update User Status (Auto-approve for demo, or set to 'pending' if you want admin manual approval)
    // The prompt said "admin will receive notification... user will receive notification that payment was successful".
    // We will set a flag so Admin sees it in Verification panel, but we confirm payment success to user.
    
    user.isVerificationRequested = true; // Shows up in Admin Dashboard -> Verification
    await user.save();

    // 4. Send Response (Notification to User)
    res.json({ 
        message: `Payment of ${finalPrice} TK Successful! Request sent to Admin for final approval.`,
        discountApplied: discount
    });
};

// --- FAQ & WISHLIST ---
const getFAQs = async (req, res) => { const f = await FAQ.find(); res.json(f); };
const askFAQ = async (req, res) => { await FAQ.create({userId: req.user._id, question: req.body.question}); res.json({msg: 'Sent'}); };
const answerFAQ = async (req, res) => { /* Admin logic */ };
const toggleWishlist = async (req, res) => { /* Wishlist logic */ res.json({msg: 'Updated'}); };

module.exports = { 
    saveSearch, getSavedSearches, requestDeletion, 
    getStories, createStory, likeStory, commentStory,
    submitUpgradeRequest, getFAQs, askFAQ, answerFAQ, toggleWishlist
};