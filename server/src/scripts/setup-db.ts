#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { connectDatabase, closeDatabase } from '../config/database';
import { DatabaseMigrator } from '../database/migrator';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Crochet Community Platform database...');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connection established');
    
    // Create migrator instance and run migrations
    console.log('🔄 Running database migrations...');
    const migrator = new DatabaseMigrator();
    await migrator.runMigrations();
    
    // Test basic database functionality
    console.log('🧪 Testing database functionality...');
    const { getPool } = require('../config/database');
    const pool = getPool();
    
    // Test query
    const result = await pool.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
    const tableCount = parseInt(result.rows[0]?.table_count || '0');
    
    console.log(`📊 Database contains ${tableCount} tables`);
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map((row: { table_name: string }) => row.table_name);
    console.log('📋 Tables created:', tables.join(', '));
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the backend server: npm run dev:backend');
    console.log('2. Start the frontend server: npm run dev');
    console.log('3. Visit http://localhost:3001/health to check API status');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

setupDatabase();