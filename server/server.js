const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();
app.use(cors({
  origin: "https://ai-trust-assistant.vercel.app/"
}));
// Initialize the app
const app = express();

// Middleware
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data


app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

// Basic Health Check Route
app.get('/api/status', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'AI Trust Assistant API is running smoothly.' 
    });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
});
