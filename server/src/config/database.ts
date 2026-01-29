import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

const poolConfig: PoolConfig = {
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432'),
  database: process.env['DB_NAME'] || 'crochet_community',
  user: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'password',
  ssl: process.env['DB_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
  
  // Connection pool settings
  min: 2, // Minimum number of connections in pool
  max: 20, // Maximum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
  maxUses: 7500, // Close connection after 7500 uses (optional)
};

export async function connectDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool(poolConfig);
    
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0]?.now);
    
    client.release();
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('❌ Unexpected error on idle client', err);
    });
    
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database connection closed');
  }
}