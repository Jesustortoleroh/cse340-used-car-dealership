// Vehicle model functions
import { getVehicleBySlug, getVehiclesByCategory } from '../../models/vehicles/vehicles.js';
import { getReviewStats } from '../../models/reviews/reviews.js';

/**
 * Vehicles list page
 * Renders the list of available vehicles filtered by category
 */
const vehiclesPage = async (req, res, next) => {
    try {

        const category = req.query.category;

        const vehicles = await getVehiclesByCategory(
            category
        );

        res.render('vehicles/list', {
            title: 'Available Vehicles',
            vehicles,
            currentCategory: category || 'All'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Vehicle detail page
 * Renders detailed information for a specific vehicle including reviews and statistics
 */
const vehicleDetailPage = async (req, res, next) => {

    try {

        const slug = req.params.slugId;

        const currentSort =
            req.query.sort || 'feature';

        const vehicle = await getVehicleBySlug(
            slug,
            currentSort
        );

        if (!vehicle) {

            const err = new Error(
                'Vehicle not found'
            );

            err.status = 404;

            return next(err);
        }

        // Get review statistics using the model function
        const reviewStats = await getReviewStats(vehicle.id);

        // Get flash messages and form data from the session if available
        let flashMessages = {};
        let formData = {};
        
        if (typeof req.flash === 'function') {
            // Get flash messages for different types
            const success = req.flash('success');
            const error = req.flash('error');
            const warning = req.flash('warning');
            const info = req.flash('info');
            
            // Keep only the first message of each type for display
            if (success.length) flashMessages.success = success[0];
            if (error.length) flashMessages.error = error[0];
            if (warning.length) flashMessages.warning = warning[0];
            if (info.length) flashMessages.info = info[0];
            
            // Get form data from flash if available (for preserving input after validation errors)
            const formDataFlash = req.flash('formData');
            if (formDataFlash.length) {
                formData = formDataFlash[0];
            }
        }

        res.render(
            'vehicles/detail',
            {
                title: vehicle.name,
                vehicle,
                user: req.session?.user || null,
                currentSort,
                // Review data from the model
                reviews: reviewStats.reviews,
                totalReviews: reviewStats.totalReviews,
                averageRating: reviewStats.averageRating,
                ratingCounts: reviewStats.ratingCounts,
                ratingPercentages: reviewStats.ratingPercentages,
                // Flash messages
                flash: flashMessages,
                // Form data for preserving input
                formData: formData
            }
        );

    } catch (error) {

        next(error);

    }
};

export { vehiclesPage, vehicleDetailPage };
