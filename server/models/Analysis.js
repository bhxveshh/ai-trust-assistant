const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Links this analysis to a specific user
    },
    targetUrl: {
        type: String,
        required: [true, 'Please provide the URL of the product or seller']
    },
    scrapedData: {
        title: { type: String, default: 'Title not found' },
        price: { type: String, default: 'Price not found' },
        rating: { type: String, default: 'Rating not found' },
        imageUrl: { type: String, default: '' },
        specs: { type: Object, default: {} } // Stores our key-value dictionary natively
    },
    aiAssessment: {
        trustScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        summary: {
            type: String,
            required: true
        },
        redFlags: {
            type: [String], // An array of strings
            default: []
        },
        verdict: {
            type: String,
            enum: ['Highly Trusted', 'Exercise Caution', 'High Risk'],
            required: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);