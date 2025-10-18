import React, { useState } from 'react';
import { Search, Star, MessageSquare, Loader2, AlertCircle, Info } from 'lucide-react';

export default function GoogleMapsRatingScraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const extractPlaceData = async (googleMapsUrl) => {
    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(googleMapsUrl)}`);
      const html = await response.text();
      
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract place name from title or meta tags
      let placeName = 'Unknown Place';
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      if (titleMatch) {
        placeName = titleMatch[1].replace(' - Google Maps', '').trim();
      }
      
      // Method 1: Look for the exact pattern in HTML
      // Pattern: <span aria-hidden="true">4.3</span>
      const ratingMatch = html.match(/<span[^>]*aria-hidden="true"[^>]*>([\d.]+)<\/span>/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
      
      // Method 2: Look for review count pattern
      // Pattern: <span aria-label="8,267 reviews">(8,267)</span>
      const reviewMatch = html.match(/aria-label="([\d,]+)\s+reviews?"/i);
      let reviewCount = null;
      if (reviewMatch) {
        reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      }
      
      // Alternative: Look for the parentheses pattern
      if (!reviewCount) {
        const altReviewMatch = html.match(/\(([0-9,]+)\)<\/span><\/span><\/span><\/div>/);
        if (altReviewMatch) {
          reviewCount = parseInt(altReviewMatch[1].replace(/,/g, ''));
        }
      }
      
      // Try JSON-LD structured data as fallback
      if (!rating || !reviewCount) {
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">({[^<]+})<\/script>/);
        if (jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            if (jsonData.aggregateRating) {
              rating = rating || parseFloat(jsonData.aggregateRating.ratingValue);
              reviewCount = reviewCount || parseInt(jsonData.aggregateRating.reviewCount);
            }
          } catch (e) {
            // JSON parse failed, continue
          }
        }
      }
      
      return {
        name: placeName,
        rating: rating,
        reviewCount: reviewCount
      };
    } catch (err) {
      throw new Error('Failed to fetch or parse Google Maps data: ' + err.message);
    }
  };

  const handleScrape = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (!url.includes('google.com/maps')) {
        throw new Error('Please enter a valid Google Maps URL');
      }

      const data = await extractPlaceData(url);
      
      if (!data.rating && !data.reviewCount) {
        throw new Error('Could not extract rating or review data. Try using a backend scraper with Puppeteer.');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Google Maps Rating Scraper
            </h1>
            <p className="text-gray-600">
              Extract ratings and review counts from any Google Maps place
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.google.com/maps/place/Apple+Park/..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleScrape()}
              />
              <button
                onClick={handleScrape}
                disabled={loading || !url}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Scrape
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Example: https://www.google.com/maps/place/Apple+Park/
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {result.name}
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {result.rating ? result.rating.toFixed(1) : 'N/A'}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Reviews</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {result.reviewCount ? formatNumber(result.reviewCount) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{result.name}</span> has{' '}
                  <span className="font-semibold text-blue-600">
                    {result.rating ? result.rating.toFixed(1) : 'N/A'}
                  </span>{' '}
                  rating with{' '}
                  <span className="font-semibold text-blue-600">
                    ({result.reviewCount ? formatNumber(result.reviewCount) : 'N/A'})
                  </span>{' '}
                  reviews
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Browser Scraping Limitations</p>
              <p>Google Maps loads content dynamically with JavaScript. This browser-based scraper may not work reliably because:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>CORS proxy limitations</li>
                <li>Content loaded after page load</li>
                <li>Google's anti-scraping measures</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-gray-800">
              Better Solution: Backend Scraper with Puppeteer
            </h3>
          </div>
          
          <p className="text-gray-700 mb-4">
            For reliable scraping, you need a Node.js backend server. Here's the code:
          </p>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <pre>{`// Install: npm install puppeteer express cors

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/scrape', async (req, res) => {
  const { url } = req.query;
  
  const browser = await puppeteer.launch({ 
    headless: true 
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait for content to load
  await page.waitForSelector('.F7nice', { timeout: 5000 });
  
  const data = await page.evaluate(() => {
    // Find rating: <span aria-hidden="true">4.3</span>
    const ratingEl = document.querySelector(
      '[aria-hidden="true"]'
    );
    const rating = ratingEl ? ratingEl.textContent : null;
    
    // Find reviews: aria-label="8,267 reviews"
    const reviewEl = document.querySelector(
      '[aria-label*="reviews"]'
    );
    const reviewMatch = reviewEl 
      ? reviewEl.getAttribute('aria-label').match(/([\\d,]+)/)
      : null;
    const reviews = reviewMatch 
      ? reviewMatch[1].replace(/,/g, '') 
      : null;
    
    const name = document.title
      .replace(' - Google Maps', '');
    
    return { name, rating, reviews };
  });
  
  await browser.close();
  res.json(data);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`}</pre>
          </div>
          
          <p className="text-sm text-gray-600 mt-4">
            Run this on your server, then your website calls: <code className="bg-gray-100 px-2 py-1 rounded">http://your-server:3000/scrape?url=GOOGLE_MAPS_URL</code>
          </p>
        </div>
      </div>
    </div>
  );
}