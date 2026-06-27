/**
 * Middleware that protects routes requiring authentication.
 *
 * Customers, employees, and owners must be logged in
 * before accessing protected resources.
 */
const requireLogin = (req, res, next) => {

    // Verify that a valid user session exists
    if (
        req.session &&
        req.session.user
    ) {

        // Used by EJS templates
        res.locals.isLoggedIn = true;

        return next();
    }

    // User is not authenticated
    res.redirect('/login');
};

export {
    requireLogin
};