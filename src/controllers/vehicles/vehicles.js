// Vehicle model functions
import { getVehicleBySlug, getVehiclesByCategory } from '../../models/vehicles/vehicles.js';
import { searchVehicles } from '../../models/vehicles/vehicles.js'; 
import { getReviewStats } from '../../models/reviews/reviews.js';

/**
 * Get sort label for display
 */
const getSortLabel = (sort) => {
    const labels = {
        'price_asc': 'Price: Low to High',
        'price_desc': 'Price: High to Low',
        'name_asc': 'Name: A to Z',
        'name_desc': 'Name: Z to A',
        'newest': 'Newest First'
    };
    return labels[sort] || 'Name: A to Z';
};

/**
 * Vehicles list page
 * Renders the list of available vehicles filtered by category or search term
 */
const vehiclesPage = async (req, res, next) => {
    try {
        // Get query parameters from URL
        const category = req.query.category || 'All';
        const search = req.query.search || '';
        const sort = req.query.sort || 'name_asc';

        let vehicles;
        let currentCategory = category;

        // If search term is provided, use search functionality
        if (search && search.trim()) {
            // Search vehicles by name or description, with optional category filter
            vehicles = await searchVehicles(
                search.trim(),
                category,
                sort
            );
            
            // Keep the category filter active for UI
            currentCategory = category || 'All';
            
        } else {
            // Otherwise, get vehicles by category (original behavior)
            vehicles = await getVehiclesByCategory(
                category
            );
            currentCategory = category || 'All';
            
            // Apply sorting to non-search results
            if (sort && sort !== 'name_asc') {
                // Sort the results based on the sort parameter
                vehicles.sort((a, b) => {
                    switch (sort) {
                        case 'price_asc':
                            return a.price - b.price;
                        case 'price_desc':
                            return b.price - a.price;
                        case 'name_desc':
                            return b.name.localeCompare(a.name);
                        case 'newest':
                            // Use id as proxy for newest if created_at not available
                            return b.id - a.id;
                        case 'name_asc':
                        default:
                            return a.name.localeCompare(b.name);
                    }
                });
            }
        }

        // Render the vehicles list view with search context
        res.render('vehicles/list', {
            title: search && search.trim() 
                ? `Search results for "${search.trim()}"` 
                : 'Available Vehicles',
            vehicles,
            currentCategory: currentCategory,
            queryParams: {
                search: search || '',
                category: category || '',
                sort: sort || 'name_asc'
            },
            sortLabel: getSortLabel(sort),
            vehicleCount: vehicles.length
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
