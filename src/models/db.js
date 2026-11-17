import { Pool } from 'pg';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Connection pool for PostgreSQL database.
 * Configured for Neon (standard SSL).
 *
 * A connection pool maintains a set of reusable database connections
 * to avoid the overhead of creating new connections for each request.
 */
const pool = new Pool({
    connectionString: env.DB_URL,
    ssl: {
        // Neon requires SSL. Node.js automatically recognizes Let's Encrypt
        // certificates, so you don't need to pass a .pem file.
        require: true
    }
});

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
    process.exit(-1);
});

// Variable to hold the database interface (wrapped or raw pool)
let db;

// Use the centralized env config for consistent environment detection
const isDevelopment = env.NODE_ENV === 'development';
const isSqlLoggingEnabled = env.ENABLE_SQL_LOGGING === 'true';

if (isDevelopment && isSqlLoggingEnabled) {
    /**
     * In development mode, wrap the pool to provide query logging.
     * This helps with debugging by showing all executed queries in the console.
     */
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                logger.debug(
                    {
                        query: text.replace(/\s+/g, ' ').trim(),
                        duration: `${duration}ms`,
                        rows: res.rowCount
                    },
                    'Executed query'
                );
                return res;
            } catch (error) {
                logger.error(
                    {
                        query: text.replace(/\s+/g, ' ').trim(),
                        error: error.message
                    },
                    'Query error'
                );
                throw error;
            }
        },
        async close() {
            await pool.end();
        }
    };
} else {
    // In production, export the pool directly without logging overhead
    db = pool;
}

export default db;
