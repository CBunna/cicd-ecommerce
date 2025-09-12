import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
config({ path: resolve(__dirname, '../../../.env') });

import { Pool } from 'pg';

// Verify environment variables are loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Current working directory:', process.cwd());
  console.log('Looking for .env file at:', resolve(__dirname, '../../../.env'));
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔗 Connecting to database...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Migration {
  id: string;
  up: (pool: Pool) => Promise<void>;
  down: (pool: Pool) => Promise<void>;
}

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query('SELECT id FROM migrations ORDER BY id');
  return result.rows.map(row => row.id);
}

async function executeMigration(migration: Migration) {
  console.log(`Executing migration: ${migration.id}`);
  await pool.query('BEGIN');
  try {
    await migration.up(pool);
    await pool.query('INSERT INTO migrations (id) VALUES ($1)', [migration.id]);
    await pool.query('COMMIT');
    console.log(`✅ Migration ${migration.id} completed`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`❌ Migration ${migration.id} failed:`, error);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('🏃 Starting migration process...');
    
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful. Current time:', result.rows[0].current_time);

    await createMigrationsTable();
    const executedMigrations = await getExecutedMigrations();
    
    // Import the initial migration
    const migrationModule = await import('./001_initial_schema');
    const up = migrationModule.up;
    const down = migrationModule.down;
    
    const migrations: Migration[] = [
      { id: '001_initial_schema', up, down }
    ];

    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.id)) {
        await executeMigration(migration);
      } else {
        console.log(`⏭️  Migration ${migration.id} already executed`);
      }
    }

    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}