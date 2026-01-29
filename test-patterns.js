// Simple test script for pattern API
const fetch = require('node-fetch');

async function testPatternAPI() {
  try {
    console.log('Testing pattern API...');
    
    // Test GET patterns
    const response = await fetch('http://localhost:3001/api/patterns');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Number of patterns:', data.patterns?.length || 0);
    
    if (data.patterns && data.patterns.length > 0) {
      console.log('First pattern:', {
        id: data.patterns[0].id,
        title: data.patterns[0].title,
        creator: data.patterns[0].creator?.name
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testPatternAPI();