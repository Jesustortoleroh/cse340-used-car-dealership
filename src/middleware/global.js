import { getUnreadCount } from '../models/notifications/notifications.js';

/**
 * Express middleware that adds head asset management functionality.
 */
const setHeadAssetsFunctionality = (res) => {
    res.locals.styles = [];
    res.locals.scripts = [];

    res.addStyle = (css, priority = 0) => {
        res.locals.styles.push({ content: css, priority });
    };

    res.addScript = (js, priority = 0) => {
        res.locals.scripts.push({ content: js, priority });
    };

    res.locals.renderStyles = () => {
        return res.locals.styles
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };

    res.locals.renderScripts = () => {
        return res.locals.scripts
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };
};

/**
 * Middleware to add local variables to res.locals for use in all templates.
 */
const addLocalVariables = async (req, res, next) => {
    // Asset system
    setHeadAssetsFunctionality(res);

    // Current year
    res.locals.currentYear = new Date().getFullYear();

    // Environment
    res.locals.NODE_ENV =
        process.env.NODE_ENV?.toLowerCase() || 'production';

    // Query parameters
    res.locals.queryParams = { ...req.query };

    // Greeting
    res.locals.greeting =
    req.session?.user
        ? `Welcome back, ${req.session.user.name}!`
        : 'Welcome to My Used Car Dealership';

    // Authentication data available in ALL views
    res.locals.user = req.session?.user || null;
    res.locals.isLoggedIn = !!req.session?.user;

    // ⭐ Notifications: Get unread count for logged-in users
    res.locals.unreadNotifications = 0;
    
    if (req.session?.userId) {
        try {
            const count = await getUnreadCount(req.session.userId);
            res.locals.unreadNotifications = count;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            res.locals.unreadNotifications = 0;
        }
    }

    next();
};

export { addLocalVariables };