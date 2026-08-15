import db from '../db.js';

/**
 * Get dashboard analytics based on user role
 */
const getDashboardAnalytics = async (userId, roleName) => {
    let analytics = {};

    // Common queries for all users
    const commonQueries = `
        SELECT 
            (SELECT COUNT(*) FROM favorites WHERE user_id = $1) AS favorites_count,
            (SELECT COUNT(*) FROM reviews WHERE user_id = $1) AS reviews_count,
            (SELECT COUNT(*) FROM service_requests WHERE user_id = $1) AS requests_count
    `;

    const commonResult = await db.query(commonQueries, [userId]);
    analytics = { ...analytics, ...commonResult.rows[0] };

    // Role-specific queries
    if (roleName === 'employee' || roleName === 'owner') {
        const employeeQueries = `
            SELECT 
                (SELECT COUNT(*) FROM contact_form WHERE status = 'Received') AS open_inquiries,
                (SELECT COUNT(*) FROM service_requests WHERE status = 'Submitted' OR status = 'In Progress') AS pending_requests,
                (SELECT COUNT(*) FROM vehicles) AS total_vehicles
        `;
        const employeeResult = await db.query(employeeQueries);
        analytics = { ...analytics, ...employeeResult.rows[0] };
    }

    if (roleName === 'owner') {
        const ownerQueries = `
            SELECT 
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM dealers) AS total_dealers,
                (SELECT COUNT(*) FROM reviews) AS total_reviews
        `;
        const ownerResult = await db.query(ownerQueries);
        analytics = { ...analytics, ...ownerResult.rows[0] };
    }

    return analytics;
};

/**
 * Get recent favorites for dashboard
 */
const getRecentFavorites = async (userId, limit = 3) => {
    const query = `
        SELECT 
            v.id,
            v.name,
            v.slug,
            v.price,
            v.year,
            v.mileage,
            v.color,
            vi.image_url,
            f.created_at
        FROM favorites f
        JOIN vehicles v ON f.vehicle_id = v.id
        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id AND vi.is_primary = true
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC
        LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
};

/**
 * Get recent reviews for dashboard
 */
const getRecentReviews = async (userId, limit = 3) => {
    const query = `
        SELECT 
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            v.name AS vehicle_name,
            v.slug AS vehicle_slug,
            v.price AS vehicle_price,
            vi.image_url
        FROM reviews r
        JOIN vehicles v ON r.vehicle_id = v.id
        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id AND vi.is_primary = true
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
};

/**
 * Get recent service requests for dashboard
 */
const getRecentRequests = async (userId, limit = 3) => {
    const query = `
        SELECT 
            sr.id,
            sr.service_type,
            sr.description,
            sr.status,
            sr.created_at,
            v.name AS vehicle_name,
            v.slug AS vehicle_slug
        FROM service_requests sr
        LEFT JOIN vehicles v ON sr.vehicle_id = v.id
        WHERE sr.user_id = $1
        ORDER BY sr.created_at DESC
        LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
};

export {
    getDashboardAnalytics,
    getRecentFavorites,
    getRecentReviews,
    getRecentRequests
};