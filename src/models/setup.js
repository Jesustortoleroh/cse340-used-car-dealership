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
        const result = await db.query('SELECT EXISTS (SELECT 1 FROM vehicles LIMIT 1) as has_data');
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
 * Apply additive schema changes without reseeding existing inventory.
 */
const ensureEnhancementSchema = async () => {
    await db.query(`
        ALTER TABLE vehicles
            ADD COLUMN IF NOT EXISTS vin VARCHAR(17),
            ADD COLUMN IF NOT EXISTS inspection_notes TEXT,
            ADD COLUMN IF NOT EXISTS service_history TEXT
    `);
    await db.query(`
        ALTER TABLE service_requests
            ADD COLUMN IF NOT EXISTS preferred_date DATE,
            ADD COLUMN IF NOT EXISTS preferred_time TIME
    `);
    await db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_vin
            ON vehicles (vin)
            WHERE vin IS NOT NULL
    `);
    await db.query(`
        INSERT INTO service_types (name, description)
        VALUES ('Test Drive', 'Request an appointment to test drive an available vehicle')
        ON CONFLICT (name) DO NOTHING
    `);
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');
    logger.info({ time: result.rows[0].current_time }, 'Database connection successful');
    return true;
};

export { setupDatabase, ensureEnhancementSchema, testConnection };
