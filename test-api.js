#!/usr/bin/env node

const axios = require('axios');

// You'll need to replace this with your actual API key
const API_KEY = process.argv[2] || 'your-api-key-here';

console.log('🔍 Testing FocusMate API with key:', API_KEY.substring(0, 8) + '...' + API_KEY.substring(API_KEY.length - 8));
console.log('🔍 Key length:', API_KEY.length);

const testEndpoints = [
  'https://api.focusmate.com/v1/sessions',
  'https://api.focusmate.com/sessions',
  'https://app.focusmate.com/api/v1/sessions'
];

const testAuthMethods = [
  { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${API_KEY}` } },
  { name: 'X-API-Key', headers: { 'X-API-Key': API_KEY } },
  { name: 'Api-Key', headers: { 'Api-Key': API_KEY } },
  { name: 'Authorization Basic', headers: { 'Authorization': `Basic ${Buffer.from(API_KEY + ':').toString('base64')}` } }
];

async function testCombination(endpoint, authMethod) {
  try {
    console.log(`\n🧪 Testing: ${endpoint} with ${authMethod.name}`);
    
    const response = await axios.get(endpoint, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Test-FocusMate-Client/1.0',
        ...authMethod.headers
      },
      timeout: 10000
    });
    
    console.log(`✅ SUCCESS! Status: ${response.status}`);
    console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ HTTP ${error.response.status}: ${error.response.statusText}`);
      if (error.response.status === 401) {
        console.log(`🔒 Auth error: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      console.log(`❌ Network error:`, error.message);
    }
    return false;
  }
}

async function runAllTests() {
  if (API_KEY === 'your-api-key-here') {
    console.log('❌ Please provide your API key as an argument:');
    console.log('   node test-api.js YOUR_ACTUAL_API_KEY');
    process.exit(1);
  }

  console.log('🚀 Starting FocusMate API tests...\n');
  
  let foundWorking = false;
  
  for (const endpoint of testEndpoints) {
    for (const authMethod of testAuthMethods) {
      const success = await testCombination(endpoint, authMethod);
      if (success) {
        foundWorking = true;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (!foundWorking) {
    console.log('\n❌ No working combination found. This could mean:');
    console.log('   1. The API key is invalid or not activated');
    console.log('   2. The API requires different authentication');
    console.log('   3. The API endpoints have changed');
    console.log('\n💡 Please verify your API key at: https://www.focusmate.com/profile/edit-p');
  }
}

runAllTests().catch(console.error);
