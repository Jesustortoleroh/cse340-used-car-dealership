/**
 * Authentication and Authorization Middleware
 * 
 * Provides middleware functions for:
 * - Requiring user authentication (requireLogin)
 * - Requiring specific roles (requireRole, requireEmployee, requireOwner)
 */

/**
 * Internal helper to check if user is logged in and active.
 * Returns true if user is valid, false otherwise.
 * Handles session destruction and redirects if necessary.
 */
const checkUserSession = (req, res) => {
    if (!req.session || !req.session.user) {
        req.flash('warning', 'Please log in to access this page.');
        res.redirect('/login');
        return false;
    }

    if (req.session.user.is_active === false) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            req.flash('error', 'Your account has been deactivated. Please contact support.');
            res.redirect('/login');
        });
        return false;
    }

    res.locals.isLoggedIn = true;
    return true;
};

/**
 * Middleware to require authentication for protected routes.
 * Redirects to login page if user is not authenticated.
 */
const requireLogin = (req, res, next) => {
    if (checkUserSession(req, res)) {
        next();
    }
};

/**
 * Middleware factory to require a specific role for route access.
 * 
 * @param {string} roleName - The role name required (e.g., 'owner', 'employee', 'customer')
 * @returns {Function} Express middleware function
 */
const requireRole = (roleName) => {
    return (req, res, next) => {
        if (!checkUserSession(req, res)) {
            return;
        }

        const userRole = req.session.user.roleName || 'customer';
        if (userRole !== roleName) {
            const err = new Error('You do not have permission to access this page.');
            err.status = 403;
            err.requiredRole = roleName;
            return next(err);
        }

        next();
    };
};

/**
 * Middleware to check if user is an employee or owner.
 */
const requireEmployee = (req, res, next) => {
    if (!checkUserSession(req, res)) {
        return;
    }

    const role = req.session.user.roleName || 'customer';
    if (role === 'employee' || role === 'owner') {
        return next();
    }

    const err = new Error('Employee access required.');
    err.status = 403;
    err.requiredRole = 'employee';
    return next(err);
};

/**
 * Middleware to check if user is an owner (admin).
 */
const requireOwner = (req, res, next) => {
    if (!checkUserSession(req, res)) {
        return;
    }

    const role = req.session.user.roleName || 'customer';
    if (role === 'owner') {
        return next();
    }

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