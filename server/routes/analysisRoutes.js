const express = require('express');
const router = express.Router();
const { analyzeProduct, getUserAnalyses } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

// Both of these routes require the user to be logged in (protect middleware)
router.post('/', protect, analyzeProduct);
router.get('/', protect, getUserAnalyses);

module.exports = router;
