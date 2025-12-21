const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Property = require('./models/Property');
const Landmark = require('./models/Landmark');
const DistrictData = require('./models/DistrictData'); 
const Story = require('./models/Story');
const FAQ = require('./models/FAQ');
const ServiceProvider = require('./models/ServiceProvider');

dotenv.config();

const connectDB = async () => {
    try { await mongoose.connect(process.env.MONGO_URI); console.log('DB Connected'); } 
    catch (err) { console.error(err); process.exit(1); }
};

const areas = ["Mirpur", "Uttara", "Gulshan", "Dhanmondi", "Banani", "Badda", "Farmgate"];
const images = ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=60"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const importData = async () => {
    try {
        // 1. CLEAR OLD DATA
        await User.deleteMany();
        await Property.deleteMany();
        await Landmark.deleteMany();
        await DistrictData.deleteMany();
        await Story.deleteMany();
        await FAQ.deleteMany();
        await ServiceProvider.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt);
        const adminPass = await bcrypt.hash('admin123', salt);

        // 2. USERS
        await User.create({ email: 'admin1@email.com', password: adminPass, role: 'admin' });
        const premiums = [];
        for(let i=1; i<=20; i++) premiums.push({ email: `premium${i}@email.com`, password, role: 'premium', membershipStartDate: new Date() });
        const premiumDocs = await User.insertMany(premiums);
        
        for(let i=1; i<=10; i++) await User.create({ email: `user${i}@email.com`, password, role: 'user' });

        // 3. PROPERTIES (120 Total)
        const props = [];
        const types = ['building', 'plot', 'apartment'];
        const actions = ['sell', 'rent'];
        
        types.forEach(type => {
            actions.forEach(act => {
                for(let i=0; i<20; i++) {
                    props.push({
                        ownerId: getRandom(premiumDocs)._id,
                        type,
                        searchType: act,
                        location: getRandom(areas),
                        price: getRandomInt(50000, 50000000),
                        details: { size: 1200, floor: 5 },
                        images: [getRandom(images)],
                        view360Url: "https://pannellum.org/images/alma.jpg",
                        rating: 4,
                        status: 'available' // <--- CRITICAL FIX HERE
                    });
                }
            });
        });
        await Property.insertMany(props);

        // 4. LANDMARKS
        const landmarks = [];
        for(let i=0; i<20; i++) landmarks.push({ name: `School ${i}`, type: 'school', location: getRandom(areas), rating: 5 });
        for(let i=0; i<20; i++) landmarks.push({ name: `Hospital ${i}`, type: 'hospital', location: getRandom(areas), rating: 5 });
        for(let i=0; i<20; i++) landmarks.push({ name: `Market ${i}`, type: 'market', location: getRandom(areas), rating: 5 });
        await Landmark.insertMany(landmarks);

        // 5. DISTRICT DATA (For Premium Graph)
        const districts = areas.map(area => ({
            areaName: area,
            crimeRate: getRandomInt(10, 60),
            priceHistory: Array.from({length: 11}, (_, k) => ({
                year: 2015 + k,
                avgPricePlot: getRandomInt(1000000, 5000000),
                avgPriceApartment: getRandomInt(3000000, 9000000),
                avgPriceBuilding: getRandomInt(10000000, 20000000)
            }))
        }));
        await DistrictData.insertMany(districts);

 // 1. Define templates strictly for 'Sale' and 'Rent'
const saleStories = [
    { title: "Sold my plot in Purbachal", content: "The process was smooth, got a great price thanks to the analysis tool." },
    { title: "Selling experience in Mirpur", content: "It took a while to find a buyer, but the verified badge helped." }
];

const rentStories = [
    { title: "Found a great apartment in Gulshan", content: "The rent is high but the amenities are worth it." },
    { title: "Renting out my flat in Uttara", content: "I found a tenant within 2 days of posting the ad here." }
];

const stories = [];
for(let i = 0; i < 20; i++) {
    // Randomly decide if this story is about Sale or Rent
    const isSale = Math.random() > 0.5;
    
    // Pick the category and a random template
    const category = isSale ? 'Sale' : 'Rent';
    const template = getRandom(isSale ? saleStories : rentStories);
    
    stories.push({
        authorId: getRandom(premiumDocs)._id,
        authorName: "Premium User",
        title: template.title,
        content: template.content,
        category: category, // <--- THIS NOW MATCHES YOUR FRONTEND BUTTONS
        status: 'approved',
        likes: getRandomInt(0, 100),
        comments: []
    });
}

// Clear old stories to avoid confusion (Optional but recommended)
await Story.deleteMany({}); 

await Story.insertMany(stories);
console.log("Stories seeded with 'Sale' and 'Rent' categories!");

        // 7. FAQs (DIVERSE QUESTIONS)
        // 1. Define the data with categories
const categorizedQuestions = [
    // --- Membership & Accounts ---
    { category: "Membership & Account", q: "How do I upgrade to Premium?", a: "Go to your dashboard and click the 'Upgrade' button." },
    { category: "Membership & Account", q: "Is the price negotiable?", a: "Yes, Premium members can send price offers directly to owners." },
    { category: "Membership & Account", q: "Is there a refund policy?", a: "Membership fees are non-refundable once paid." },
    { category: "Membership & Account", q: "How do I delete my account?", a: "You can request account deletion from your user dashboard." },
    { category: "Membership & Account", q: "I forgot my password, what do I do?", a: "Click on 'Forgot Password' at the login screen to receive a reset link." }, // NEW

    // --- Property Management ---
    { category: "Property Management", q: "How do I list my property?", a: "Navigate to 'Advertise' on your dashboard and fill out the form." },
    { category: "Property Management", q: "Can I edit my story after posting?", a: "No, stories are final once approved by the admin." },
    { category: "Property Management", q: "Can I rent out my apartment here?", a: "Yes, select 'Rent' as the ad type when posting." },
    { category: "Property Management", q: "How long does verification take?", a: "Usually 24-48 hours after you submit your request." },
    { category: "Property Management", q: "How many photos can I upload?", a: "You can upload up to 10 high-quality images per listing." }, // NEW

    // --- Safety & Legal ---
    { category: "Safety & Legal", q: "How accurate is the crime rate data?", a: "It is based on the latest available district reports." },
    { category: "Safety & Legal", q: "How do I report a fake listing?", a: "Use the 'Report' button on the property details page." },
    { category: "Safety & Legal", q: "Do you offer legal assistance?", a: "We can connect you with legal experts via our Contacts page." },
    { category: "Safety & Legal", q: "Is my personal data safe?", a: "Yes, we use industry-standard encryption." },
    { category: "Safety & Legal", q: "What documents do I need for verification?", a: "You need a valid NID or Passport and proof of property ownership." }, // NEW

    // --- General & Payments ---
    { category: "General Info", q: "What areas are covered?", a: "We cover major areas like Mirpur, Uttara, Gulshan, and Dhanmondi." },
    { category: "General Info", q: "Can I contact property owners directly?", a: "Only Premium members can view owner contact details." },
    { category: "General Info", q: "What payment methods are supported?", a: "We currently support bKash and bank transfers." },
    { category: "General Info", q: "Do you have a mobile app?", a: "We are currently working on an Android and iOS app." }, // NEW
    { category: "General Info", q: "How do I contact customer support?", a: "You can email us at support@ghorbari.com or use the chat widget." } // NEW
];

// 2. Insert Logic (Make sure to include the category field)
const faqs = [];

// Loop through the specific categorized list instead of random picking
for(let item of categorizedQuestions) {
    faqs.push({
        userId: getRandom(premiumDocs)._id, // Assuming you have this function from your existing code
        question: item.q,
        answer: item.a,
        category: item.category, // <--- IMPORTANT: SAVING THE CATEGORY
        isAnswered: true
    });
}

await FAQ.insertMany(faqs);
console.log("Categorized FAQs inserted!");

        // 8. SERVICE PROVIDERS
        const providers = [];
        for(let i=0; i<10; i++) providers.push({
            category: 'developer', 
            name: `Dev Co ${i}`, 
            contactInfo: '017000000', 
            officeLocation: getRandom(areas), 
            projectsCompleted: getRandomInt(5, 50) // Random number 5-50
        });
        
        for(let i=0; i<10; i++) providers.push({
            category: 'interior', 
            name: `Interior Co ${i}`, 
            contactInfo: '018000000', 
            officeLocation: getRandom(areas), 
            projectsCompleted: getRandomInt(10, 100) // Random number 10-100
        });
        
        for(let i=0; i<30; i++) providers.push({
            category: 'technician', 
            name: `Tech worker ${i}`, 
            contactInfo: '019000000', 
            subCategory: 'plumber', 
            projectsCompleted: getRandomInt(20, 200) // <--- ADDED THIS LINE (Random number 20-200)
        });
        
        await ServiceProvider.insertMany(providers);

        console.log('🎉 Fixed Data Imported: 120 AVAILABLE Properties!');
        process.exit();
    } catch (err) { console.error(err); process.exit(1); }
};

connectDB().then(importData);