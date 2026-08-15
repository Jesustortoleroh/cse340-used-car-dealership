import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../../models/notifications/notifications.js';

/**
 * Show notifications page
 */
const showNotifications = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const notifications = await getUserNotifications(userId, 50);
        const unreadCount = await getUnreadCount(userId);

        res.render('notifications/index', {
            title: 'Notifications',
            notifications,
            unreadCount,
            user: req.session?.user || null,
            isLoggedIn: true,
            messages: req.flash()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get unread count (for AJAX)
 */
const getUnreadCountAjax = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const count = await getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark a notification as read
 */
const markAsReadController = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const notificationId = parseInt(req.params.id);
        
        await markAsRead(notificationId, userId);
        req.flash('success', 'Notification marked as read.');
        res.redirect('/notifications');
    } catch (error) {
        next(error);
    }
};

/**
 * Mark all notifications as read
 */
const markAllAsReadController = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        await markAllAsRead(userId);
        req.flash('success', 'All notifications marked as read.');
        res.redirect('/notifications');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a notification
 */
const deleteNotificationController = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const notificationId = parseInt(req.params.id);
        
        await deleteNotification(notificationId, userId);
        req.flash('success', 'Notification deleted.');
        res.redirect('/notifications');
    } catch (error) {
        next(error);
    }
};

export {
    showNotifications,
    getUnreadCountAjax,
    markAsReadController,
    markAllAsReadController,
    deleteNotificationController
};