/**
 * Flash Message Middleware
 * 
 * Provides temporary message storage that survives redirects but is consumed on render.
 * Messages are stored in the session and organized by type (success, error, warning, info).
 * 
 * Usage in controllers:
 *   req.flash('success', 'Message text')  // Store a message
 *   req.flash('error')                    // Get all error messages
 *   req.flash()                           // Get all messages (all types)
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
        console.log('[FLASH] Redirect called, sessionNeedsSave:', sessionNeedsSave);
        if (sessionNeedsSave && req.session) {
            console.log('[FLASH] Saving session before redirect');
            // Save session before redirecting
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
    req.flash = function(type, message) {
        console.log('[FLASH] flash() called with type:', type, 'message:', message);
        
        // Guard: If session doesn't exist (e.g., after session.destroy()), 
        // return early to prevent errors. Flash messages require a session to store.
        if (!req.session) {
            console.log('[FLASH] No session found!');
            // If setting a message (both type and message provided), can't do without session
            if (type && message) {
                return; // Silently fail - no session to store in
            }
            // If getting messages, return empty structure
            return { success: [], error: [], warning: [], info: [] };
        }

        // Initialize flash storage if it doesn't exist
        if (!req.session.flash) {
            console.log('[FLASH] Initializing flash storage');
            req.session.flash = {
                success: [],
                error: [],
                warning: [],
                info: []
            };
        }

        // SETTING: Two arguments means we're storing a new message
        if (type && message) {
            console.log('[FLASH] Storing message - type:', type, 'message:', message);
            // Ensure this message type's array exists
            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }
            // Add the message to the appropriate type array
            req.session.flash[type].push(message);
            console.log('[FLASH] Current flash storage:', JSON.stringify(req.session.flash));
            // Mark that session needs to be saved before redirect
            sessionNeedsSave = true;
            return;
        }

        // GETTING ONE TYPE: One argument means retrieve messages of that type
        if (type && !message) {
            console.log('[FLASH] Retrieving messages for type:', type);
            const messages = req.session.flash[type] || [];
            // Clear this type's messages after retrieving
            req.session.flash[type] = [];
            console.log('[FLASH] Retrieved messages:', messages);
            return messages;
        }

        // GETTING ALL: No arguments means retrieve all message types
        console.log('[FLASH] Retrieving ALL messages');
        const allMessages = req.session.flash || {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        console.log('[FLASH] All messages before clearing:', JSON.stringify(allMessages));

        // Clear all flash messages after retrieving
        req.session.flash = {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        console.log('[FLASH] All messages after clearing:', JSON.stringify(req.session.flash));
        return allMessages;
    };

    next();
};

/**
* Make flash function available to all templates via res.locals
* This middleware must run AFTER flashMiddleware
*/
const flashLocals = (req, res, next) => {
    console.log('[FLASH] flashLocals called');
    // Attach the flash function to res.locals so templates can access it
    // The function is NOT called here, just made available
    // Messages are only consumed when a template calls flash()
    res.locals.flash = req.flash;
    console.log('[FLASH] res.locals.flash type:', typeof res.locals.flash);
    next();
};

/**
* Combined flash middleware that runs both functions in the correct order
* Import and use this as a single middleware function in your application
*/
const flash = (req, res, next) => {
    console.log('[FLASH] Combined flash middleware called for:', req.url);
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;