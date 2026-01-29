#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { connectDatabase, closeDatabase } from '../config/database';
import { DatabaseMigrator } from '../database/migrator';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigrations() {
  try {
    console.log('🚀 Starting migration process...');
    
    // Connect to database
    await connectDatabase();
    
    // Create migrator instance
    const migrator = new DatabaseMigrator();
    
    // Run migrations
    await migrator.runMigrations();
    
    console.log('🎉 Migration process completed successfully');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

async function rollbackMigration() {
  try {
    console.log('⏪ Starting rollback process...');
    
    // Connect to database
    await connectDatabase();
    
    // Create migrator instance
    const migrator = new DatabaseMigrator();
    
    // Rollback last migration
    await migrator.rollbackLastMigration();
    
    console.log('🎉 Rollback process completed successfully');
  } catch (error) {
    console.error('❌ Rollback process failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case 'up':
    runMigrations();
    break;
  case 'down':
    rollbackMigration();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run migrate up    - Run pending migrations');
    console.log('  npm run migrate down  - Rollback last migration');
    process.exit(1);
}