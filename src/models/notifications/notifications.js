import db from '../db.js';

/**
 * Create a notification for a user
 */
const createNotification = async (userId, type, title, message, link = null) => {
    const query = `
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const result = await db.query(query, [userId, type, title, message, link]);
    return result.rows[0];
};

/**
 * Get all notifications for a user
 */
const getUserNotifications = async (userId, limit = 10) => {
    const query = `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
};

/**
 * Get unread notifications count for a user
 */
const getUnreadCount = async (userId) => {
    const query = `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = $1 AND is_read = false
    `;
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count);
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId, userId) => {
    const query = `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1 AND user_id = $2
        RETURNING *
    `;
    const result = await db.query(query, [notificationId, userId]);
    return result.rows[0] || null;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
    const query = `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = $1 AND is_read = false
        RETURNING *
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
    const query = `
        DELETE FROM notifications
        WHERE id = $1 AND user_id = $2
    `;
    const result = await db.query(query, [notificationId, userId]);
    return result.rowCount > 0;
};

export {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};