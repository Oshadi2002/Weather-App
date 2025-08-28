const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const { auth } = require('express-oauth2-jwt-bearer');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// OpenWeather API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_API;

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache with 5-minute TTL and checking period
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Don't clone data when getting/setting (better performance)
});

// Cache events for debugging
cache.on('set', (key, value) => {
  console.log(`Cache: Data stored for key "${key}"`);
});

cache.on('get', (key) => {
  console.log(`Cache: Attempting to retrieve data for key "${key}"`);
});

cache.on('expired', (key) => {
  console.log(`Cache: Data expired for key "${key}"`);
});

cache.on('del', (key) => {
  console.log(`Cache: Data deleted for key "${key}"`);
});

// Configure CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));
app.use(express.json());

// Validate Auth0 configuration
const validateAuth0Config = () => {
  const issuerURL = process.env.AUTH0_ISSUER_BASE_URL;
  const audience = process.env.AUTH0_AUDIENCE;
  
  if (!issuerURL || issuerURL === 'https://YOUR_TENANT_REGION.auth0.com/') {
    throw new Error('Invalid AUTH0_ISSUER_BASE_URL. Please set your Auth0 domain in .env file');
  }
  
  if (!audience || audience === 'https://weather.api') {
    throw new Error('Invalid AUTH0_AUDIENCE. Please set your Auth0 API identifier in .env file');
  }
  
  return { issuerURL, audience };
};

// Configure Auth0 middleware
let jwtCheck;
try {
  const { issuerURL, audience } = validateAuth0Config();
  console.log('Configuring Auth0 with:', {
    issuerBaseURL: issuerURL,
    audience: audience
  });
  
  jwtCheck = auth({
    audience: audience,
    issuerBaseURL: issuerURL,
    tokenSigningAlg: 'RS256'
  });
} catch (error) {
  console.error('Auth0 Configuration Error:', error.message);
  // Setting a dummy middleware that always returns 401 with configuration error
  jwtCheck = (req, res, next) => {
    res.status(401).json({
      error: 'Auth0 Configuration Error',
      message: error.message,
      setup: {
        required: {
          AUTH0_ISSUER_BASE_URL: 'Your Auth0 domain (e.g., https://your-tenant.region.auth0.com/)',
          AUTH0_AUDIENCE: 'Your API identifier from Auth0 dashboard'
        },
        current: {
          AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
          AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE
        }
      }
    });
  };
}



// Error handling middleware for Auth0
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.error('Auth Error Details:', err);
    const error = {
      error: 'Unauthorized',
      message: err.message || 'Missing or invalid token',
      help: {
        checkToken: 'Use /api/debug/token to inspect your token',
        configuration: {
          audience: process.env.AUTH0_AUDIENCE,
          issuer: process.env.AUTH0_ISSUER_BASE_URL
        }
      }
    };
    
    if (err.inner) {
      error.details = err.inner.message;
    }
    
    return res.status(401).json(error);
  }
  next();
});

// Helper function to read cities data from JSON file
const getCitiesData = async () => {
  try {
    const dataPath = path.join(__dirname, 'data', 'cities.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData.List;
  } catch (error) {
    console.error('Error reading cities.json:', error);
    // Return empty array instead of undefined to prevent map() errors
    return [];
  }
};


// Helper function to fetch real weather data from OpenWeatherMap API
const fetchWeatherData = async (city) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured');
    }

    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${city.lat}&lon=${city.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;

    return {
      cityCode: city.CityCode,
      cityName: city.CityName,
      coordinates: {
        lat: city.lat,
        lon: city.lon
      },
      temperature: {
        current: data.main.temp,
        feels_like: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
        unit: 'celsius'
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: {
        speed: data.wind.speed,
        direction: data.wind.deg
      },
      visibility: data.visibility,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching weather data for ${city.CityName}:`, error.message);
    throw error;
  }
};

// ================== ROUTES ==================

// Helper function to manage cache operations
const cacheManager = {
  async get(key) {
    try {
      const value = cache.get(key);
      console.log(value);
      console.log(`Cache [GET] "${key}":`, value ? 'HIT' : 'MISS');
      return value;
    } catch (error) {
      console.error(`Cache [ERROR] Failed to get key "${key}":`, error);
      return null;
    }
  },

  async set(key, value, ttl = 300) {
    try {
      const success = cache.set(key, value, ttl);
      console.log(`Cache [SET] "${key}":`, success ? 'SUCCESS' : 'FAILED');
      return success;
    } catch (error) {
      console.error(`Cache [ERROR] Failed to set key "${key}":`, error);
      return false;
    }
  }
};

// Weather route with improved cache handling
app.get('/api/weather', jwtCheck, async (req, res) => {
  try {
    const cacheKey = 'weather_all';
    
    // Try to get data from cache
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log('Serving weather data from cache');
      return res.json({
        ...cachedData,
        source: 'cache'
      });
    }

    // If no cached data, fetch fresh data
    const allCities = await getCitiesData();
    
    if (!allCities || allCities.length === 0) {
      throw new Error('No cities data available');
    }

    // Fetch weather data for all cities
    const weatherPromises = allCities.map(city => fetchWeatherData(city));
    const weatherData = await Promise.all(weatherPromises);

    const response = {
      count: weatherData.length,
      data: weatherData,
      generated_at: new Date().toISOString(),
      source: 'api'
    };

    // Store in cache
    await cacheManager.set(cacheKey, response);
    console.log('Weather data cached successfully');
    res.json(response);
  } catch (error) {
    console.error('Error in /api/weather:', error);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Auth0 Issuer URL: ${process.env.AUTH0_ISSUER_BASE_URL || 'Not configured'}`);
  console.log(`Auth0 Audience: ${process.env.AUTH0_AUDIENCE || 'Not configured'}`);
  console.log('Weather data source: data/cities.json');
});
