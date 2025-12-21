const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./models/Property');
const User = require('./models/User');

dotenv.config(); // Load your .env file

const check = async () => {
    try {
        console.log("1. Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("   ✅ Connected!");

        const countProps = await Property.countDocuments();
        const countUsers = await User.countDocuments();
        const availableProps = await Property.countDocuments({ status: 'available' });

        console.log("\n--- DATABASE REPORT ---");
        console.log(`Total Users:      ${countUsers}`);
        console.log(`Total Properties: ${countProps}`);
        console.log(`Available Props:  ${availableProps}`);
        console.log("-----------------------");

        if (countProps === 0) {
            console.log("❌ FAILURE: Database is empty. You need to run 'node seeder.js'");
        } else if (availableProps === 0) {
            console.log("⚠️ WARNING: Properties exist but NONE are 'available'. Check seeder status.");
        } else {
            console.log("✅ SUCCESS: Data exists. The issue is likely in the Frontend code.");
        }

        process.exit();
    } catch (error) {
        console.error("❌ CONNECTION ERROR:", error.message);
        process.exit(1);
    }
};

check();
