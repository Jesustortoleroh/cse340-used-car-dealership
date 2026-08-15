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
            u.profile_image,
            u.avatar_style,
            u.last_login,
            u.is_active,
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

/**
 * Update user last login
 */
const updateLastLogin = async (userId) => {
    const query = `
        UPDATE users
        SET last_login = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, last_login
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
};

/**
 * Update user profile image
 */
const updateProfileImage = async (userId, imageUrl) => {
    const query = `
        UPDATE users
        SET profile_image = $1,
            avatar_style = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, name, profile_image, avatar_style
    `;

    const result = await db.query(query, [imageUrl, userId]);
    return result.rows[0] || null;
};

/**
 * Update user avatar style
 */
const updateAvatarStyle = async (userId, avatarStyle) => {
    const query = `
        UPDATE users
        SET avatar_style = $1,
            profile_image = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, name, profile_image, avatar_style
    `;

    const result = await db.query(query, [avatarStyle, userId]);
    return result.rows[0] || null;
};

/**
 * Deactivate user account
 */
const deactivateUser = async (userId) => {
    const query = `
        UPDATE users
        SET is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, is_active
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
};

/**
 * Reactivate user account
 */
const reactivateUser = async (userId) => {
    const query = `
        UPDATE users
        SET is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, is_active
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
};

export {
    getUserProfile,
    getFavoriteCount,
    getReviewCount,
    getServiceRequestCount,
    updateLastLogin,
    updateProfileImage,
    updateAvatarStyle,
    deactivateUser,
    reactivateUser
};