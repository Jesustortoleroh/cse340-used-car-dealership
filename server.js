import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import compression from 'compression';
import pinoHttp from 'pino-http';
import passport from 'passport';

// Configuration & Logger
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

// Middlewares
import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';
import flash from './src/middleware/flash.js';
import { attachCsrfToken, csrfProtection } from './src/middleware/csrf.js';
import { notFoundHandler, globalErrorHandler } from './src/middleware/errorHandler.js';

// Database & Utils
import { setupDatabase, ensureEnhancementSchema, testConnection } from './src/models/setup.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';
import { ensureSocialAuthSchema } from './src/models/forms/socialAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Render/Heroku
app.set('trust proxy', 1);

// ==========================================
// Logging HTTP requests (Clean output)
// ==========================================
app.use(
    pinoHttp({
        logger,
        // Ignore static assets to keep the console clean
        autoLogging: {
            ignore: (req) =>
                req.url.startsWith('/css/') ||
                req.url.startsWith('/js/') ||
                req.url.startsWith('/images/')
        },
        // Only log essential request/response data
        serializers: {
            req: (req) => ({ method: req.method, url: req.url }),
            res: (res) => ({ statusCode: res.statusCode })
        },
        // Custom message format
        customSuccessMessage: (req, res) => {
            return `${req.method} ${req.url} - ${res.statusCode}`;
        },
        customErrorMessage: (req, res, err) => {
            return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
        }
    })
);

// Compression (gzip)
app.use(compression());

// Security Headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'ws:', 'wss:']
            }
        }
    })
);

// Session Store
const pgSession = connectPgSimple(session);
app.use(
    session({
        store: new pgSession({
            conObject: {
                connectionString: env.DB_URL,
                ssl: { require: true }
            },
            tableName: 'session',
            createTableIfMissing: true
        }),
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// Core Middleware
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Custom Middleware
app.use(attachCsrfToken);
app.use(addLocalVariables);
app.use(flash);

// Rate Limiting (Only in production)
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again after 15 minutes',
        standardHeaders: true,
        legacyHeaders: false,
        // Skip rate limiting in development
        skip: (_req, _res) => env.NODE_ENV !== 'production'
    })
);

// CSRF Protection
const csrfMiddleware = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return csrfProtection(req, res, next);
    }
    next();
};

// Routes
app.use('/', csrfMiddleware, routes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Prepare the database before accepting requests that depend on the schema.
const startServer = async () => {
    try {
        await testConnection();
        await setupDatabase();
        await ensureEnhancementSchema();
        await ensureSocialAuthSchema();
        startSessionCleanup();
        await new Promise((resolve, reject) => {
            const server = app.listen(env.PORT, resolve);
            server.once('error', reject);
        });
        logger.info(`🚀 Server running on http://127.0.0.1:${env.PORT} [${env.NODE_ENV}]`);
    } catch (error) {
        logger.fatal(error, '❌ Failed to start server');
        process.exit(1);
    }
};

startServer();
