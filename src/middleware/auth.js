/**
 * Authentication and Authorization Middleware
 * 
 * Provides middleware functions for:
 * - Requiring user authentication (requireLogin)
 * - Requiring specific roles (requireRole)
 * - Employee and Owner access control with proper error handling
 */

/**
 * Middleware to require authentication for protected routes.
 * Redirects to login page if user is not authenticated.
 * Sets res.locals.isLoggedIn = true for authenticated requests.
 */
const requireLogin = (req, res, next) => {
    // Check if user is logged in via session
    if (req.session && req.session.user) {
        // User is authenticated - set UI state and continue
        res.locals.isLoggedIn = true;
        return next();
    }

    // User is not authenticated - redirect to login with flash message
    if (typeof req.flash === 'function') {
        req.flash('warning', 'Please log in to access this page.');
    }
    res.redirect('/login');
};

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 * 
 * @param {string} roleName - The role name required (e.g., 'owner', 'employee', 'customer')
 * @returns {Function} Express middleware function
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
        const userRole = req.session.user.roleName || 'customer';
        if (userRole !== roleName) {
            // ✅ MEJORADO: Usar error handler en lugar de redirect
            const err = new Error('You do not have permission to access this page.');
            err.status = 403;
            err.requiredRole = roleName;
            return next(err);
        }

        // User has required role, continue
        next();
    };
};

/**
 * Middleware to check if user is an employee or owner
 * (For employee dashboard access)
 */
const requireEmployee = (req, res, next) => {
    // Check if user is logged in first
    if (!req.session || !req.session.user) {
        if (typeof req.flash === 'function') {
            req.flash('error', 'You must be logged in to access this page.');
        }
        return res.redirect('/login');
    }

    const role = req.session.user.roleName || 'customer';
    if (role === 'employee' || role === 'owner') {
        return next();
    }
    
    // ✅ MEJORADO: Usar error handler en lugar de redirect
    const err = new Error('Employee access required.');
    err.status = 403;
    err.requiredRole = 'employee';
    return next(err);
};

/**
 * Middleware to check if user is an owner (admin)
 * (For admin dashboard access)
 */
const requireOwner = (req, res, next) => {
    // Check if user is logged in first
    if (!req.session || !req.session.user) {
        if (typeof req.flash === 'function') {
            req.flash('error', 'You must be logged in to access this page.');
        }
        return res.redirect('/login');
    }

    const role = req.session.user.roleName || 'customer';
    if (role === 'owner') {
        return next();
    }
    
    // ✅ MEJORADO: Usar error handler en lugar de redirect
    const err = new Error('Owner access required.');
    err.status = 403;
    err.requiredRole = 'owner';
    return next(err);
};

export { 
    requireLogin, 
    requireRole, 
    requireEmployee, 
    requireOwner 
};