/**
 * Authentication and Authorization Middleware
 * 
 * Provides middleware functions for:
 * - Requiring user authentication (requireLogin)
 * - Requiring specific roles (requireRole)
 * - Making auth data available to templates (checkAuth)
 */

/**
 * Middleware that protects routes requiring authentication.
 * 
 * Customers, employees, and owners must be logged in
 * before accessing protected resources.
 */
const requireLogin = (req, res, next) => {
    // Verify that a valid user session exists
    if (req.session && req.session.user) {
        // Used by EJS templates
        res.locals.isLoggedIn = true;
        return next();
    }

    // User is not authenticated
    if (typeof req.flash === 'function') {
        req.flash('warning', 'Please log in to access this page.');
    }
    res.redirect('/login');
};

/**
 * Middleware factory to require specific role for route access
 * 
 * Returns middleware that checks if user has the required role.
 * 
 * @param {string} roleName - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Protect admin routes
 * router.get('/admin', requireRole('admin'), adminController);
 * 
 * // Protect employee routes
 * router.get('/staff', requireRole('employee'), staffController);
 */
const requireRole = (roleName) => {
    return (req, res, next) => {
        // Check if user is logged in first
        if (!req.session || !req.session.user) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'You must be logged in to access this page.');
            }
            return res.redirect('/login');
        }

        // Check if user's role matches the required role
        if (req.session.user.roleName !== roleName) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'You do not have permission to access this page.');
            }
            return res.redirect('/');
        }

        // User has required role, continue
        next();
    };
};

/**
 * Middleware to check authentication status and make user data available to templates
 * 
 * This middleware runs on every request and sets:
 * - res.locals.isLoggedIn: boolean indicating if user is authenticated
 * - res.locals.user: the current user object (or null)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkAuth = (req, res, next) => {
    const isLoggedIn = !!(req.session && req.session.user);
    
    res.locals.isLoggedIn = isLoggedIn;
    res.locals.user = isLoggedIn ? req.session.user : null;
    
    next();
};

export {
    requireLogin,
    requireRole,
    checkAuth
};