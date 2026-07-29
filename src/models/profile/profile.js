import db from '../db.js';

/**
 * Get user profile information
 */
const getUserProfile = async (userId) => {
    const query = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.created_at,
            r.role_name
        FROM users u
        JOIN roles r
            ON r.id = u.role_id
        WHERE u.id = $1
    `;

    const result = await db.query(
        query,
        [userId]
    );

    return result.rows[0] || null;
};

/**
 * Count user favorites
 */
const getFavoriteCount = async (userId) => {
    const query = `
        SELECT COUNT(*) AS total
        FROM favorites
        WHERE user_id = $1
    `;

    const result = await db.query(
        query,
        [userId]
    );

    return parseInt(result.rows[0].total);
};

/**
 * Count user reviews
 */
const getReviewCount = async (userId) => {
    const query = `
        SELECT COUNT(*) AS total
        FROM reviews
        WHERE user_id = $1
    `;

    const result = await db.query(
        query,
        [userId]
    );

    return parseInt(result.rows[0].total);
};

/**
 * Count user service requests
 */
const getServiceRequestCount = async (userId) => {
    const query = `
        SELECT COUNT(*) AS total
        FROM service_requests
        WHERE user_id = $1
    `;

    const result = await db.query(
        query,
        [userId]
    );

    return parseInt(result.rows[0].total);
};

export {
    getUserProfile,
    getFavoriteCount,
    getReviewCount,
    getServiceRequestCount
};