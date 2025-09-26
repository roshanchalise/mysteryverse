// Vercel serverless function entry point
const path = require('path');

// Set environment for production
process.env.NODE_ENV = 'production';

// Set up the path to the backend directory
process.chdir(path.join(__dirname, '..', 'backend'));

// Load environment variables from backend
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Load the main server
module.exports = require('../backend/server.js');