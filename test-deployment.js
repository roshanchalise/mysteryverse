#!/usr/bin/env node

// Test deployment script
const https = require('https');
const http = require('http');

console.log('🔍 Testing Mystery Verse Deployment\n');

// Function to test URL
function testUrl(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;

    console.log(`Testing ${description}...`);

    const req = client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ ${description} - OK`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
          } catch (e) {
            console.log(`✅ ${description} - OK (HTML response)`);
            console.log(`   Status: ${res.statusCode}`);
          }
        } else {
          console.log(`❌ ${description} - Failed`);
          console.log(`   Status: ${res.statusCode}`);
        }
        console.log('');
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${description} - Error`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${description} - Timeout`);
      console.log('');
      req.destroy();
      resolve();
    });
  });
}

async function main() {
  // Test common Railway and Vercel URL patterns
  const railwayUrls = [
    'https://mysteryverse-production.railway.app',
    'https://mysteryverse.railway.app',
    // Add your actual Railway URL here
  ];

  const vercelUrls = [
    'https://mysteryverse.vercel.app',
    'https://mystery-verse.vercel.app',
    // Add your actual Vercel URL here
  ];

  console.log('🚂 Testing Railway Backend URLs:');
  for (const url of railwayUrls) {
    await testUrl(url, `Railway Backend (${url})`);
  }

  console.log('▲ Testing Vercel Frontend URLs:');
  for (const url of vercelUrls) {
    await testUrl(url, `Vercel Frontend (${url})`);
  }

  console.log('💡 Instructions:');
  console.log('1. Replace the URLs above with your actual deployment URLs');
  console.log('2. Run this script again: node test-deployment.js');
  console.log('3. All tests should show ✅ when deployments are working');
}

main().catch(console.error);