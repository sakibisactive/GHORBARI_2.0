const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// ... existing imports
const adminRoutes = require('./routes/adminRoutes'); // <--- ADD THIS
const premiumRoutes = require('./routes/premiumRoutes'); // <--- ADD THIS
// ...
 // <--- ADD THIS
// ... existing app.use
const publicRoutes = require('./routes/publicRoutes');
// ...
const actionRoutes = require('./routes/actionRoutes');
const userRoutes = require('./routes/userRoutes');
// ...

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/admin', adminRoutes); // <--- ADD THIS
// Basic Route for testing
app.use('/api/premium', premiumRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
    res.send('GHORBARI API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
