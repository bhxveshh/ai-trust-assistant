const Analysis = require('../models/Analysis');
const { buildWebContext } = require('../services/serpApiService');
const { analyzeTrust } = require('../services/geminiService');
const { scrapeProductPage } = require('../services/scraperService');

// @desc    Analyze a new product/seller URL
// @route   POST /api/analysis
// @access  Private (Requires Token)
const analyzeProduct = async (req, res) => {
    try {
        const { targetUrl } = req.body;

        if (!targetUrl) {
            return res.status(400).json({ message: 'Please provide a target URL to analyze.' });
        }

        console.log(`Scraping on-page data for: ${targetUrl}...`);
        const scrapedData = await scrapeProductPage(targetUrl); 
        console.log(`Scraped: ${scrapedData.title} | ${scrapedData.price} | ${scrapedData.rating}`);

        console.log(`Gathering multi-query context via SerpAPI...`);
        const webContext = await buildWebContext(targetUrl, scrapedData);

        console.log('Sending structured data to Gemini for evaluation...');
        const aiResult = await analyzeTrust(targetUrl, scrapedData, webContext);

        // Save the nested JSON result to MongoDB matching our new schema
        const savedAnalysis = await Analysis.create({
            user: req.user.id, 
            targetUrl: targetUrl,
            scrapedData: scrapedData,          // Saves title, price, rating, imageUrl, and specs natively
            aiAssessment: {                    // Groups the AI data cleanly
                trustScore: aiResult.trustScore,
                summary: aiResult.summary,
                redFlags: aiResult.redFlags,
                verdict: aiResult.verdict
            }
        });

        // Send the fully formatted, nested report back to the frontend
        res.status(201).json(savedAnalysis);

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ message: 'Failed to complete analysis.', error: error.message });
    }
};

// @desc    Get all past analyses for the logged-in user
// @route   GET /api/analysis
// @access  Private
const getUserAnalyses = async (req, res) => {
    try {
        // Find all analyses where the 'user' field matches the logged-in user's ID
        // Sort by newest first (-1)
        const history = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
        
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch history.' });
    }
};

module.exports = {
    analyzeProduct,
    getUserAnalyses
};