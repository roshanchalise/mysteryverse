// Vercel serverless function entry point
const path = require('path');

// Set up the path to the backend directory
process.chdir(path.join(__dirname, '..', 'backend'));

// Load the main server
module.exports = require('../backend/server.js');