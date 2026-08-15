import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { getDashboardAnalytics, getRecentFavorites, getRecentReviews, getRecentRequests } from '../../models/analytics/analytics.js';
import { updateLastLogin } from '../../models/profile/profile.js';

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

        // Check if user account is active
        if (user.is_active === false) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Your account has been deactivated. Please contact support.');
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

        // Update last login timestamp
        await updateLastLogin(user.id);

        // Remove password before storing in session
        delete user.password;

        // Store user in session
        req.session.user = user;
        req.session.userId = user.id;

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
 * Protected dashboard - Show user data with analytics
 */
const showDashboard = async (req, res) => {
    try {
        // Get user from session
        const userId = req.session.userId;
        const user = req.session.user;

        // Security: Ensure password is never exposed
        if (user && user.password) {
            console.error('Security error: password found in user object');
            delete user.password;
        }

        if (!userId || !user) {
            req.flash('error', 'Please login first.');
            return res.redirect('/login');
        }

        // Get user role name
        const roleName = user?.roleName || 'customer';

        // Get analytics based on user role
        const analytics = await getDashboardAnalytics(userId, roleName);
        
        // Get recent activity (limited to 3 each)
        const recentFavorites = await getRecentFavorites(userId, 3);
        const recentReviews = await getRecentReviews(userId, 3);
        const recentRequests = await getRecentRequests(userId, 3);

        // Prepare analytics for display
        const analyticsData = {
            customer: {
                favorites: parseInt(analytics.favorites_count) || 0,
                reviews: parseInt(analytics.reviews_count) || 0,
                requests: parseInt(analytics.requests_count) || 0
            },
            employee: {
                openInquiries: parseInt(analytics.open_inquiries) || 0,
                pendingRequests: parseInt(analytics.pending_requests) || 0,
                totalVehicles: parseInt(analytics.total_vehicles) || 0
            },
            owner: {
                totalUsers: parseInt(analytics.total_users) || 0,
                totalVehicles: parseInt(analytics.total_vehicles) || 0,
                totalDealers: parseInt(analytics.total_dealers) || 0,
                totalReviews: parseInt(analytics.total_reviews) || 0
            }
        };

        res.render('dashboard', {
            title: 'Dashboard',
            user: user,
            analytics: analyticsData,
            recentFavorites,
            recentReviews,
            recentRequests,
            isLoggedIn: true,
            messages: req.flash()
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Unable to load dashboard. Please try again later.');
        res.redirect('/login');
    }
};

export { showLoginForm, processLogin, processLogout, showDashboard };