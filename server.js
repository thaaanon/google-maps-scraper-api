const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (you can restrict this later)
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Google Maps Scraper API',
    endpoints: {
      scrape: '/scrape?url=YOUR_GOOGLE_MAPS_URL'
    }
  });
});

// Main scraping endpoint
app.get('/scrape', async (req, res) => {
  const { url } = req.query;

  // Validate URL
  if (!url) {
    return res.status(400).json({ 
      error: 'Missing URL parameter',
      usage: '/scrape?url=YOUR_GOOGLE_MAPS_URL'
    });
  }

  if (!url.includes('google.com/maps')) {
    return res.status(400).json({ 
      error: 'Invalid URL. Please provide a valid Google Maps URL'
    });
  }

  let browser;
  try {
    console.log('Launching browser...');
    
    // Launch Puppeteer with optimized settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('Navigating to URL...');
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for the rating section to load
    console.log('Waiting for content...');
    await page.waitForSelector('.F7nice', { timeout: 10000 });

    // Give it a bit more time for dynamic content
    await page.waitForTimeout(2000);

    // Extract data from the page
    console.log('Extracting data...');
    const data = await page.evaluate(() => {
      // Extract place name from title
      const name = document.title.replace(' - Google Maps', '').trim();

      // Find rating: <span aria-hidden="true">4.3</span>
      const ratingElement = document.querySelector('.F7nice [aria-hidden="true"]');
      const rating = ratingElement ? ratingElement.textContent.trim() : null;

      // Find reviews: aria-label="8,267 reviews"
      const reviewElement = document.querySelector('.F7nice [aria-label*="review"]');
      let reviewCount = null;
      
      if (reviewElement) {
        const ariaLabel = reviewElement.getAttribute('aria-label');
        const match = ariaLabel.match(/([\d,]+)\s+review/i);
        if (match) {
          reviewCount = match[1].replace(/,/g, '');
        }
      }

      // Alternative: try to find review count in parentheses
      if (!reviewCount) {
        const reviewText = document.querySelector('.F7nice')?.textContent;
        const match = reviewText?.match(/\(([\d,]+)\)/);
        if (match) {
          reviewCount = match[1].replace(/,/g, '');
        }
      }

      return {
        name: name,
        rating: rating ? parseFloat(rating) : null,
        reviewCount: reviewCount ? parseInt(reviewCount) : null,
        scrapedAt: new Date().toISOString()
      };
    });

    await browser.close();

    console.log('Data extracted:', data);

    // Return the scraped data
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Scraping error:', error.message);
    
    if (browser) {
      await browser.close();
    }

    res.status(500).json({
      success: false,
      error: 'Failed to scrape Google Maps',
      message: error.message,
      hint: 'Make sure the URL is valid and accessible'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Google Maps Scraper API running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📝 Usage: http://localhost:${PORT}/scrape?url=YOUR_GOOGLE_MAPS_URL`);
});