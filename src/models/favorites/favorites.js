import db from '../db.js';

/**
 * Add favorite
 */
const addFavorite = async (userId, vehicleId) => {
    const query = `
        INSERT INTO favorites (
            user_id,
            vehicle_id
        )
        VALUES ($1, $2)
        ON CONFLICT (user_id, vehicle_id)
        DO NOTHING
        RETURNING *
    `;

    const result = await db.query(
        query,
        [userId, vehicleId]
    );

    return result.rows[0] || null;
};

/**
 * Remove favorite
 */
const removeFavorite = async (userId, vehicleId) => {
    const query = `
        DELETE FROM favorites
        WHERE user_id = $1
        AND vehicle_id = $2
        RETURNING *
    `;

    const result = await db.query(
        query,
        [userId, vehicleId]
    );

    return result.rowCount > 0;
};

/**
 * Check if favorite exists
 */
const isFavorite = async (userId, vehicleId) => {
    const query = `
        SELECT id
        FROM favorites
        WHERE user_id = $1
        AND vehicle_id = $2
    `;

    const result = await db.query(
        query,
        [userId, vehicleId]
    );

    return result.rowCount > 0;
};

/**
 * Get all user favorites
 */
const getUserFavorites = async (userId) => {
    const query = `
        SELECT
            v.*,
            c.name AS category_name,
            vi.image_url
        FROM favorites f
        JOIN vehicles v
            ON v.id = f.vehicle_id
        JOIN categories c
            ON c.id = v.category_id
        LEFT JOIN vehicle_images vi
            ON vi.vehicle_id = v.id
            AND vi.is_primary = true
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC
    `;

    const result = await db.query(
        query,
        [userId]
    );

    return result.rows;
};

export {
    addFavorite,
    removeFavorite,
    isFavorite,
    getUserFavorites
};