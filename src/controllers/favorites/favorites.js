import {
    addFavorite,
    removeFavorite,
    getUserFavorites
} from '../../models/favorites/favorites.js';

/**
 * Add favorite
 */
const addFavoriteController = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        const vehicleId = parseInt(req.params.vehicleId);

        if (!userId) {
            req.flash('error', 'Please login first.');
            return res.redirect('/login');
        }

        await addFavorite(userId, vehicleId);

        req.flash('success', 'Vehicle added to favorites ❤️');

        return res.redirect(
            req.get('referer') || '/vehicles'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Remove favorite
 */
const removeFavoriteController = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        const vehicleId = parseInt(req.params.vehicleId);

        if (!userId) {
            req.flash('error', 'Please login first.');
            return res.redirect('/login');
        }

        await removeFavorite(userId, vehicleId);

        req.flash('info', 'Vehicle removed from favorites.');

        return res.redirect(
            req.get('referer') || '/favorites'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Favorites page
 */
const favoritesListPage = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;

        if (!userId) {
            req.flash('error', 'Please login first.');
            return res.redirect('/login');
        }

        const favorites = await getUserFavorites(userId);

        res.render('favorites/list', {
            title: 'My Favorite Vehicles',
            favorites
        });
    } catch (error) {
        next(error);
    }
};

export {
    addFavoriteController,
    removeFavoriteController,
    favoritesListPage
};