const axios = require('axios');
const cheerio = require('cheerio');

const scrapeProductPage = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        const $ = cheerio.load(data);

        // 1. Basic Metadata
        const title = $('#productTitle').text().trim() || 'Title not found';
        const price = $('.a-price .a-offscreen').first().text().trim() || 'Price not found';
        const rating = $('#acrPopover').attr('title') || 'Rating not found';

        // 2. High-Res Product Image
        const imageUrl = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src') || '';

        // 3. Technical Specifications Dictionary
        const specs = {};
        
        // Try to parse the clean "Product Overview" table first
        $('#poExpander tbody tr, .a-normal.a-spacing-micro tbody tr').each((i, el) => {
            // Strip hidden directional characters Amazon sometimes injects
            const key = $(el).find('td.a-span3, th').text().trim().replace(/[\u200F\u200E]/g, '');
            const value = $(el).find('td.a-span9, td').last().text().trim().replace(/[\u200F\u200E]/g, '');
            
            if (key && value && Object.keys(specs).length < 6) {
                specs[key] = value;
            }
        });

        // Fallback: If no spec table exists, grab the first 5 feature bullet points
        if (Object.keys(specs).length === 0) {
            $('#feature-bullets ul li span.a-list-item').each((i, el) => {
                if (i < 5) {
                    specs[`Feature ${i + 1}`] = $(el).text().trim();
                }
            });
        }

        return { title, price, rating, imageUrl, specs };

    } catch (error) {
        console.error("Scraping Error:", error.message);
        return { title: 'Unknown', price: 'Unknown', rating: 'Unknown', imageUrl: '', specs: {} };
    }
};

module.exports = { scrapeProductPage };