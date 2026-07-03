import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';


/**
 * Display login form
 */
const showLoginForm = (req, res) => {
    res.render('forms/login/form', {
        title: 'Dealership Login'
    });
};

/**
 * Process login - Uses generic error messages for security
 * (Prevents account enumeration attacks)
 */
const processLogin = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Store validation errors as flash messages
        errors.array().forEach(error => {
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });
        return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await findUserByEmail(email);

        // GENERIC ERROR MESSAGE - Security best practice
        // Don't reveal if email exists or password is wrong
        if (!user) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Invalid email or password');
            }
            return res.redirect('/login');
        }

        // Verify password
        const validPassword = await verifyPassword(password, user.password);

        // GENERIC ERROR MESSAGE - Same as above for security
        if (!validPassword) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Invalid email or password');
            }
            return res.redirect('/login');
        }

        // Remove password before storing in session
        delete user.password;

        // Store user in session
        req.session.user = user;

        // Success message
        if (typeof req.flash === 'function') {
            req.flash('success', `Welcome back to our dealership, ${user.name || user.email}!`);
        }

        // Redirect to dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to log in. Please try again later.');
        }
        res.redirect('/login');
    }
};

/**
 * Logout user
 */
const processLogout = (req, res) => {
    // Add logout message before destroying session
    if (typeof req.flash === 'function') {
        req.flash('info', 'You have been successfully logged out.');
    }

    if (!req.session) {
        return res.redirect('/');
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.clearCookie('connect.sid');
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

/**
 * Protected dashboard - Only show necessary user data
 */
const showDashboard = (req, res) => {
    // Get user from session
    const user = req.session.user;
    const sessionData = req.session;

    // Security: Ensure password is never exposed
    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
    }

    if (sessionData.user && sessionData.user.password) {
        console.error('Security error: password found in sessionData.user');
        delete sessionData.user.password;
    }

    res.render('dashboard', {
        title: 'Customer Dashboard',
        user: user,
        sessionData: sessionData
    });
};


export { showLoginForm, processLogin, processLogout, showDashboard };