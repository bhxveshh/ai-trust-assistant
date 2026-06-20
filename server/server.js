const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Connect to Database
connectDB();

// Allowed frontend origins (no trailing slashes!)
const allowedOrigins = [
  "https://ai-trust-assistant.vercel.app",
  "https://ai-trust-assistant-git-main-rishik28.vercel.app",
  "https://ai-trust-assistant-wid5y1md8-rishik28.vercel.app",
  "http://localhost:5173", // for local dev with Vite
];

// CORS - single call, no duplicates
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// Routes
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
