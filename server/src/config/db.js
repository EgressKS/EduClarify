import pkg from 'pg';
const { Pool } = pkg;

let pool;

export async function connectDB() {
  if (pool) return pool;

  const { ENV } = await import('./env.js');

  const poolConfig = ENV.databaseUrl ? {
    connectionString: ENV.databaseUrl,
    max: 5, 
    min: 1, 
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 20000, 
    acquireTimeoutMillis: 60000,
  } : {
    host: ENV.dbHost || 'localhost',
    port: ENV.dbPort || 5432,
    database: ENV.dbName || 'educlarify',
    user: ENV.dbUser || 'postgres',
    password: ENV.dbPassword || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
  pool = new Pool(poolConfig);

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Database connection attempt ${attempt}/3`);
      const client = await pool.connect();
      console.log('Database connected successfully');

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      client.release();
      console.log('Database tables initialized');
      break;
    } catch (err) {
      lastError = err;
      console.error(`Database connection attempt ${attempt} failed:`, err.message);

      if (attempt < 3) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  if (lastError) {
    console.error('All database connection attempts failed');
    throw lastError;
  }

  return pool;
}

export function getDB() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
}

export async function closeDB() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection closed');
  }
}
