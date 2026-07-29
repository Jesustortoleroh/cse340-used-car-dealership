import {
    getUserProfile,
    getFavoriteCount,
    getReviewCount,
    getServiceRequestCount
} from '../../models/profile/profile.js';

/**
 * Profile page - Show user profile with statistics
 */
const profilePage = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;

        if (!userId) {
            req.flash('error', 'Please login first.');
            return res.redirect('/login');
        }

        // Get user profile information
        const profile = await getUserProfile(userId);

        if (!profile) {
            req.flash('error', 'User not found.');
            return res.redirect('/dashboard');
        }

        // Get user statistics
        const favoriteCount = await getFavoriteCount(userId);
        const reviewCount = await getReviewCount(userId);
        const serviceRequestCount = await getServiceRequestCount(userId);

        res.render('profile/index', {
            title: 'My Profile',
            profile,
            favoriteCount,
            reviewCount,
            serviceRequestCount,
            user: req.session.user,
            isLoggedIn: true,
            messages: req.flash()
        });

    } catch (error) {
        next(error);
    }
};

export {
    profilePage
};