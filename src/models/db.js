import { Pool } from 'pg';

/**
 * Connection pool for PostgreSQL database.
 * Configured for Neon (standard SSL).
 *
 * A connection pool maintains a set of reusable database connections
 * to avoid the overhead of creating new connections for each request.
 */
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        // Neon requires SSL. Node.js automatically recognizes Let's Encrypt 
        // certificates, so you don't need to pass a .pem file.
        require: true
    }
});

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

let db = null;

// Ensure NODE_ENV exists before using .includes to avoid errors
if (process.env.NODE_ENV && process.env.NODE_ENV.includes('dev') && process.env.ENABLE_SQL_LOGGING === 'true') {
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
                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${duration}ms`,
                    rows: res.rowCount
                });
                return res;
            } catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });
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
