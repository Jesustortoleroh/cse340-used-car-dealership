import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import {
    getDashboardAnalytics,
    getRecentFavorites,
    getRecentReviews,
    getRecentRequests
} from '../../models/analytics/analytics.js';
import { updateLastLogin } from '../../models/profile/profile.js';
import { oauthProviders } from '../../config/passport.js';
import { createAuthenticatedSession } from '../../utils/authentication.js';

/**
 * Display login form
 */
const showLoginForm = (req, res) => {
    res.render('forms/login/form', {
        title: 'Dealership Login',
        csrfToken: res.locals.csrfToken,
        oauthProviders
    });
};

/**
 * Process login - Uses generic error messages for security
 * (Prevents account enumeration attacks)
 */
const processLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        // GENERIC ERROR MESSAGE - Security best practice
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Check if user account is active
        if (user.is_active === false) {
            req.flash('error', 'Your account has been deactivated. Please contact support.');
            return res.redirect('/login');
        }

        // Verify password
        const validPassword = await verifyPassword(password, user.password);

        if (!validPassword) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Update last login timestamp
        await updateLastLogin(user.id);

        // Remove password before storing in session (Security best practice)
        delete user.password;

        await createAuthenticatedSession(req, user);

        // Success message
        req.flash('success', `Welcome back to our dealership, ${user.name || user.email}!`);

        // Redirect to dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Unable to log in. Please try again later.');
        res.redirect('/login');
    }
};

/**
 * Logout user
 */
const processLogout = (req, res) => {
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
        const userId = req.session.userId;
        const user = req.session.user;

        if (!userId || !user) {
            req.flash('error', 'Please login first.');
            return res.redirect('/login');
        }

        // Security: Ensure password is never exposed
        if (user.password) {
            console.error('Security error: password found in user object');
            delete user.password;
        }

        const roleName = user?.roleName || 'customer';

        const analytics = await getDashboardAnalytics(userId, roleName);
        const recentFavorites = await getRecentFavorites(userId, 3);
        const recentReviews = await getRecentReviews(userId, 3);
        const recentRequests = await getRecentRequests(userId, 3);

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
            csrfToken: res.locals.csrfToken // Explicitly pass the CSRF token
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Unable to load dashboard. Please try again later.');
        res.redirect('/login');
    }
};

export { showLoginForm, processLogin, processLogout, showDashboard };
