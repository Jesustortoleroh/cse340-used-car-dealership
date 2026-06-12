import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Sets up the database by running the seed.sql file if needed.
 * Checks if vehicles table has data - if not, runs a full re-seed.
 */
const setupDatabase = async () => {

  // Check if vehicles table has data
  let hasData = false;

  try {
    const result = await db.query(
      "SELECT EXISTS (SELECT 1 FROM vehicles LIMIT 1) as has_data"
    );

    hasData = result.rows[0]?.has_data || false;

  } catch (error) {
    // If table doesn't exist → treat as empty
    hasData = false;
  }

  //  If already seeded → skip
  if (hasData) {
    console.log('Vehicles database already seeded ✅');
    return true;
  }

  // Run seed.sql
  console.log('Seeding vehicles database...');

  const seedPath = join(__dirname, 'sql', 'seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf8');

  await db.query(seedSQL);

  console.log('Vehicles database seeded successfully ✅');

  return true;
};

/**
 * Tests the database connection
 */
const testConnection = async () => {
  const result = await db.query('SELECT NOW() as current_time');

  console.log('Database connection successful:', result.rows[0].current_time);

  return true;
};

export { setupDatabase, testConnection };
