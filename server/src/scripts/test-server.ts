#!/usr/bin/env ts-node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Simple test server without database dependency
const app = express();
const PORT = 3002; // Use different port for testing

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Crochet Community Platform API Test Server',
    timestamp: new Date().toISOString(),
    environment: 'test',
  });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Crochet Community Platform API Test',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// Start test server
const server = app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 API endpoint: http://localhost:${PORT}/api`);
});

// Test the endpoints
async function testEndpoints() {
  try {
    console.log('🔄 Testing endpoints...');
    
    // Test health endpoint
    const healthResponse = await fetch(`http://localhost:${PORT}/health`);
    const healthData = await healthResponse.json() as { status: string };
    
    if (healthResponse.ok && healthData.status === 'OK') {
      console.log('✅ Health endpoint working');
    } else {
      throw new Error('Health endpoint failed');
    }
    
    // Test API endpoint
    const apiResponse = await fetch(`http://localhost:${PORT}/api`);
    const apiData = await apiResponse.json() as { message: string };
    
    if (apiResponse.ok && apiData.message) {
      console.log('✅ API endpoint working');
    } else {
      throw new Error('API endpoint failed');
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    server.close();
    console.log('🔌 Test server closed');
  }
}

// Wait a moment for server to start, then test
setTimeout(testEndpoints, 1000);