/**
 * Flash Message Middleware
 * 
 * Provides temporary message storage that survives redirects but is consumed on render.
 * Messages are stored in the session and organized by type (success, error, warning, info).
 */

/**
 * Initialize flash message storage and provide access methods
 */
const flashMiddleware = (req, res, next) => {
    // Track if flash messages were set (need to save session before redirect)
    let sessionNeedsSave = false;

    // Override res.redirect to save session before redirecting
    const originalRedirect = res.redirect.bind(res);
    res.redirect = (...args) => {
        if (sessionNeedsSave && req.session) {
            req.session.save(() => {
                originalRedirect.apply(res, args);
            });
        } else {
            originalRedirect.apply(res, args);
        }
    };

    /**
     * The flash function handles both setting and getting messages
     * - Called with 2 args (type, message): stores a new message
     * - Called with 1 arg (type): retrieves and clears messages of that type
     * - Called with 0 args: retrieves and clears all messages
     */
    req.flash = function (type, message) {
        // Guard: If session doesn't exist, return early to prevent errors.
        if (!req.session) {
            if (type && message) {
                return; // Silently fail - no session to store in
            }
            return { success: [], error: [], warning: [], info: [] };
        }

        // Initialize flash storage if it doesn't exist
        if (!req.session.flash) {
            req.session.flash = {
                success: [],
                error: [],
                warning: [],
                info: []
            };
        }

        // SETTING: Two arguments means we're storing a new message
        if (type && message) {
            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }
            req.session.flash[type].push(message);
            sessionNeedsSave = true;
            return;
        }

        // GETTING ONE TYPE: One argument means retrieve messages of that type
        if (type && !message) {
            const messages = req.session.flash[type] || [];
            req.session.flash[type] = [];
            return messages;
        }

        // GETTING ALL: No arguments means retrieve all message types
        const allMessages = req.session.flash || {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        // Clear all flash messages after retrieving
        req.session.flash = {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        return allMessages;
    };

    next();
};

/**
 * Make flash function available to all templates via res.locals.
 * This middleware must run AFTER flashMiddleware.
 */
const flashLocals = (req, res, next) => {
    res.locals.flash = req.flash;
    next();
};

/**
 * Combined flash middleware that runs both functions in the correct order.
 */
const flash = (req, res, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;