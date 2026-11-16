import { csrfSync } from 'csrf-sync';

// Configure CSRF protection
const {
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => {
        // Look for the token in the body (for standard forms)
        // or in the headers (for AJAX/fetch requests)
        return req.body._csrf || req.headers['x-csrf-token'];
    }
});

// Middleware to expose the token to EJS views (res.locals.csrfToken)
export const attachCsrfToken = (req, res, next) => {
    res.locals.csrfToken = generateToken(req);
    next();
};

// Export the protection middleware to use on routes
export const csrfProtection = csrfSynchronisedProtection;