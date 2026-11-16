import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// Import MVC components
import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';
import flash from './src/middleware/flash.js';
import { attachCsrfToken, csrfProtection } from './src/middleware/csrf.js';
import { setupDatabase, testConnection } from './src/models/setup.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';

/**
 * 1. Server configuration
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

/**
 * 2. Setup Express Server
 */
const app = express();

// Trust proxy is required for secure cookies and rate limiting to work in production (e.g., Render)
app.set('trust proxy', 1);

// Security headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], 
            styleSrc: ["'self'", "'unsafe-inline'"],  
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],    
        },
    },
}));

/**
 * 3. Session Configuration
 */
const pgSession = connectPgSimple(session);

app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL,
            ssl: { require: true }
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production', 
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

/**
 * 4. Express Core Middleware
 */
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

/**
 * 5. Custom Global Middleware
 */
// Generate CSRF token for every request (must be after session middleware)
app.use(attachCsrfToken);

// Global middleware (sets res.locals variables)
app.use(addLocalVariables);

// Flash message middleware (must come after session and global middleware)
app.use(flash);

/**
 * 6. Rate Limiting
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);

/**
 * 7. Routes
 */
const csrfMiddleware = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return csrfProtection(req, res, next);
    }
    next();
};

app.use('/', csrfMiddleware, routes);

/**
 * 8. Error Handling
 */
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent || res.finished) {
        return next(err);
    }

    const status = err.status || err.statusCode || 500;
    
    let template = '500';
    let title = 'Server Error';
    
    switch (status) {
        case 400:
            template = '400';
            title = 'Bad Request';
            break;
        case 403:
            template = '403';
            title = 'Access Denied';
            break;
        case 404:
            template = '404';
            title = 'Page Not Found';
            break;
        default:
            template = '500';
            title = 'Server Error';
    }

    const context = {
        title,
        error: NODE_ENV === 'production' ? 'An error occurred.' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        user: req.session?.user || null,
        requiredRole: err.requiredRole || null,
        NODE_ENV
    };

    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        if (!res.headersSent) {
            res.status(status).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error ${status}</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { font-size: 2.5em; color: #333; }
                        p { color: #666; }
                        a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>⚠️ Error ${status}</h1>
                    <p>${status === 404 ? 'Page not found' : 'An error occurred'}</p>
                    <a href="/">Return Home</a>
                </body>
                </html>
            `);
        }
    }
});

/**
 * 9. Start WebSocket Server in Development Mode
 */
if (NODE_ENV === 'development') {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

/**
 * 10. Start Server
 */
app.listen(PORT, async () => {
    try {
        await testConnection();
        await setupDatabase();
        startSessionCleanup();
        console.log(`Server is running on http://127.0.0.1:${PORT}`);
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
});