const axios = require('axios');

async function testClinicalAnalyticsAPI() {
  const baseURL = 'http://localhost:3000/api';
  
  // First, login to get a token
  console.log('🔐 Logging in...');
  
  try {
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@clinic.com',
      password: 'admin12354'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test clinical reports endpoints
    const reportTypes = [
      'common-diagnoses',
      'diagnosis-frequency', 
      'seasonal-trends',
      'disease-prevalence',
      'chronic-disease',
      'lab-volumes',
      'lab-revenue',
      'lab-turnaround',
      'clinic-overview'
    ];
    
    console.log('\n📊 Testing Clinical Analytics Endpoints...\n');
    
    for (const reportType of reportTypes) {
      try {
        console.log(`🔍 Testing ${reportType}...`);
        
        const response = await axios.get(`${baseURL}/patient-history/reports/clinical/${reportType}`, {
          headers,
          params: {
            date_from: '2024-01-01',
            date_to: '2024-12-31',
            limit: 10
          }
        });
        
        console.log(`✅ ${reportType}: ${response.status} - ${Array.isArray(response.data) ? response.data.length : 1} results`);
        
        // Show sample data for first few reports
        if (['common-diagnoses', 'lab-volumes', 'clinic-overview'].includes(reportType)) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log(`   Sample: ${JSON.stringify(response.data[0], null, 2).substring(0, 200)}...`);
          } else if (typeof response.data === 'object') {
            console.log(`   Sample: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
          }
        }
        
      } catch (error) {
        console.log(`❌ ${reportType}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.error || error.message}`);
      }
    }
    
    console.log('\n✅ Clinical Analytics API testing completed!');
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get('http://localhost:3000/health');
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first with: npm start');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testClinicalAnalyticsAPI();
  }
}

main();