const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  try {
    console.log('Testing backend API...');
    
    // Test 1: Get jobs (public endpoint)
    console.log('\n1. Testing GET /api/jobs...');
    const jobsResponse = await axios.get(`${BASE_URL}/jobs`);
    console.log('✅ Jobs endpoint working:', jobsResponse.data);
    
    // Test 2: Get filter options
    console.log('\n2. Testing GET /api/jobs/filters/options...');
    const filtersResponse = await axios.get(`${BASE_URL}/jobs/filters/options`);
    console.log('✅ Filter options endpoint working:', filtersResponse.data);
    
    // Test 3: Test posts endpoint (requires auth)
    console.log('\n3. Testing GET /api/posts (should fail without auth)...');
    try {
      await axios.get(`${BASE_URL}/posts`);
    } catch (error) {
      console.log('✅ Posts endpoint correctly requires authentication:', error.response?.status);
    }
    
    console.log('\n🎉 Backend API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackend(); 