import fs from 'fs';
import path from 'path';
import { getPool } from '../config/database';

interface Migration {
  id: string;
  filename: string;
  sql: string;
}

export class DatabaseMigrator {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
  }

  async createMigrationsTable(): Promise<void> {
    const pool = getPool();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Migrations table ready');
  }

  async getExecutedMigrations(): Promise<string[]> {
    const pool = getPool();
    
    const result = await pool.query(
      'SELECT filename FROM migrations ORDER BY executed_at ASC'
    );
    
    return result.rows.map(row => row.filename);
  }

  async getMigrationFiles(): Promise<Migration[]> {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const migrations: Migration[] = [];

    for (const filename of files) {
      const filePath = path.join(this.migrationsPath, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      const id = filename.replace('.sql', '');
      
      migrations.push({ id, filename, sql });
    }

    return migrations;
  }

  async executeMigration(migration: Migration): Promise<void> {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      // Check if migration already executed
      const alreadyRun = await client.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [migration.filename]
      );
      
      if (alreadyRun.rows.length > 0) {
        console.log(`⏭️  Skipping migration (already executed): ${migration.filename}`);
        return;
      }
      
      await client.query('BEGIN');
      
      console.log(`🔄 Executing migration: ${migration.filename}`);
      
      // Execute migration SQL
      await client.query(migration.sql);
      
      // Record migration as executed
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [migration.filename]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Executed migration: ${migration.filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to execute migration ${migration.filename}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Starting database migrations...');
      
      // Ensure migrations table exists
      await this.createMigrationsTable();
      
      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      console.log(`📋 Found ${executedMigrations.length} executed migrations`);
      
      // Get all migration files
      const allMigrations = await this.getMigrationFiles();
      console.log(`📁 Found ${allMigrations.length} migration files`);
      
      // Find pending migrations
      const pendingMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.filename)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }
      
      console.log(`🔄 Executing ${pendingMigrations.length} pending migrations...`);
      
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async rollbackLastMigration(): Promise<void> {
    const pool = getPool();
    
    try {
      const result = await pool.query(
        'SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1'
      );
      
      if (result.rows.length === 0) {
        console.log('ℹ️ No migrations to rollback');
        return;
      }
      
      const lastMigration = result.rows[0]?.filename;
      
      // Remove from migrations table
      await pool.query(
        'DELETE FROM migrations WHERE filename = $1',
        [lastMigration]
      );
      
      console.log(`⏪ Rolled back migration: ${lastMigration}`);
      console.log('⚠️ Note: This only removes the migration record. Manual schema changes may be needed.');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}