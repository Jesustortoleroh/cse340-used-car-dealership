/**
 * Helper function to get the current greeting based on the time of day.
 */
const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return 'Good Morning!';
    }

    if (currentHour < 18) {
        return 'Good Afternoon!';
    }

    return 'Good Evening!';
};

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
const addLocalVariables = (req, res, next) => {
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
    res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;

    // Authentication data available in ALL views
    res.locals.user = req.session?.user || null;
    res.locals.isLoggedIn = !!req.session?.user;

    next();
};

export { addLocalVariables };