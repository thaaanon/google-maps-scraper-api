# Google Maps Scraper API 🗺️

A backend API to scrape ratings and review counts from Google Maps using Puppeteer.

## 📋 Features

- ✅ Scrapes rating (e.g., 4.3)
- ✅ Scrapes review count (e.g., 8,267)
- ✅ Extracts place name
- ✅ CORS enabled for frontend integration
- ✅ Ready for deployment

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `puppeteer` - Headless browser for scraping
- `cors` - Enable cross-origin requests

### 2. Run Locally

```bash
npm start
```

Server will start at `http://localhost:3000`

### 3. Test the API

Open your browser or use curl:

```bash
# Example: Scrape Apple Park
http://localhost:3000/scrape?url=https://www.google.com/maps/place/Apple+Park/@37.3346143,-122.0115831,17z/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Apple Park",
    "rating": 4.3,
    "reviewCount": 8267,
    "scrapedAt": "2025-10-18T12:00:00.000Z"
  }
}
```

## 📡 API Endpoints

### GET `/`
Health check endpoint
```json
{
  "status": "online",
  "message": "Google Maps Scraper API"
}
```

### GET `/scrape?url=GOOGLE_MAPS_URL`
Scrape Google Maps place data

**Parameters:**
- `url` (required) - Full Google Maps place URL

**Example:**
```
/scrape?url=https://www.google.com/maps/place/Taj+Mahal/
```

## 🌐 Deploy to Production

### Option 1: Deploy to Railway (Free)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Railway will auto-detect and deploy!

Your API will be live at: `https://your-app.railway.app`

### Option 2: Deploy to Render (Free)

1. Go to [Render.com](https://render.com)
2. Sign up and click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"

Your API will be live at: `https://your-app.onrender.com`

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI first
heroku login
heroku create your-app-name
git push heroku main
```

## 🔧 Environment Variables

For production, you can set:

- `PORT` - Server port (default: 3000)

Example `.env` file:
```
PORT=3000
```

## 💻 Frontend Integration

Once deployed, use it in your frontend:

```javascript
const apiUrl = 'https://your-deployed-api.com';
const googleMapsUrl = 'https://www.google.com/maps/place/Apple+Park/';

fetch(`${apiUrl}/scrape?url=${encodeURIComponent(googleMapsUrl)}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Display: Apple Park has 4.3 rating with (8,267) reviews
  });
```

## 🛡️ Error Handling

The API returns appropriate error messages:

```json
{
  "success": false,
  "error": "Failed to scrape Google Maps",
  "message": "Navigation timeout of 30000 ms exceeded"
}
```

## ⚠️ Important Notes

1. **Rate Limiting**: Google may rate limit or block excessive requests
2. **Terms of Service**: Web scraping may violate Google's ToS
3. **Production Use**: Consider using Google Places API for official projects
4. **Puppeteer Memory**: Puppeteer uses ~100-200MB RAM per request

## 🔒 Security Recommendations

For production:
1. Add rate limiting (use `express-rate-limit`)
2. Add API key authentication
3. Restrict CORS to your domain only
4. Add request logging
5. Implement caching to reduce scraping frequency

## 📦 Project Structure

```
google-maps-scraper-api/
├── server.js          # Main API server
├── package.json       # Dependencies
├── README.md          # This file
└── .gitignore         # Git ignore file
```

## 🐛 Troubleshooting

**Issue:** Puppeteer fails to launch
- **Solution:** Make sure you have enough RAM (minimum 512MB)

**Issue:** Scraping returns null values
- **Solution:** Google Maps structure may have changed. Check console logs.

**Issue:** Timeout errors
- **Solution:** Increase timeout in `page.goto()` or check internet connection

## 📝 License

MIT - Feel free to use this for your projects!

## 🤝 Contributing

Feel free to submit issues or pull requests!

---

Made with ❤️ for scraping Google Maps ratings