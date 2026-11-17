import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Sets up the database by running the seed.sql file if needed.
 * Checks if vehicles table has data - if not, runs a full re-seed.
 */
const setupDatabase = async () => {
    /**
     * Check if vehicles table has any rows and wrap in try-catch to handle cases
     * where table doesn't exist yet.
     */
    let hasData;
    try {
        const result = await db.query(
            "SELECT EXISTS (SELECT 1 FROM vehicles LIMIT 1) as has_data"
        );
        hasData = result.rows[0]?.has_data || false;
    } catch {
        /**
         * If query fails (e.g., table doesn't exist), treat the same as no data.
         * This allows the seed process to proceed.
         */
        hasData = false;
    }

    if (hasData) {
        logger.info('Vehicles database already seeded ✅');
        return true;
    }

    // No vehicles found - run full seed
    logger.info('Seeding vehicles database...');
    const seedPath = join(__dirname, 'sql', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await db.query(seedSQL);
    logger.info('Vehicles database seeded successfully ✅');

    return true;
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');
    logger.info({ time: result.rows[0].current_time }, 'Database connection successful');
    return true;
};

export { setupDatabase, testConnection };