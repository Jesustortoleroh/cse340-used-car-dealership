import { getVehicleBySlug, getVehiclesByCategory, searchVehicles } from '../../models/vehicles/vehicles.js';
import { getReviewStats } from '../../models/reviews/reviews.js';
import { isFavorite } from '../../models/favorites/favorites.js';

/**
 * Get sort label for display
 */
const getSortLabel = (sort) => {
    const labels = {
        price_asc: 'Price: Low to High',
        price_desc: 'Price: High to Low',
        name_asc: 'Name: A to Z',
        name_desc: 'Name: Z to A',
        newest: 'Newest First'
    };
    return labels[sort] || 'Name: A to Z';
};

/**
 * Vehicles list page
 * Renders the list of available vehicles filtered by category or search term
 */
const vehiclesPage = async (req, res, next) => {
    try {
        const category = req.query.category || 'All';
        const search = req.query.search || '';
        const sort = req.query.sort || 'name_asc';

        let vehicles;
        let currentCategory = category;

        if (search && search.trim()) {
            vehicles = await searchVehicles(search.trim(), category, sort);
            currentCategory = category || 'All';
        } else {
            vehicles = await getVehiclesByCategory(category);
            currentCategory = category || 'All';

            if (sort && sort !== 'name_asc') {
                vehicles.sort((a, b) => {
                    switch (sort) {
                        case 'price_asc': return a.price - b.price;
                        case 'price_desc': return b.price - a.price;
                        case 'name_desc': return b.name.localeCompare(a.name);
                        case 'newest': return b.id - a.id;
                        case 'name_asc':
                        default: return a.name.localeCompare(b.name);
                    }
                });
            }
        }

        res.render('vehicles/list', {
            title: search && search.trim()
                ? `Search results for "${search.trim()}"`
                : 'Available Vehicles',
            vehicles,
            currentCategory,
            queryParams: {
                search: search || '',
                category: category || '',
                sort: sort || 'name_asc'
            },
            sortLabel: getSortLabel(sort),
            vehicleCount: vehicles.length
            // Flash messages are handled globally by header.ejs
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
        const currentSort = req.query.sort || 'feature';

        const vehicle = await getVehicleBySlug(slug, currentSort);

        if (!vehicle) {
            const err = new Error('Vehicle not found');
            err.status = 404;
            return next(err);
        }

        const reviewStats = await getReviewStats(vehicle.id);

        let isFavoriteStatus = false;
        const userId = req.session?.user?.id;

        if (userId) {
            isFavoriteStatus = await isFavorite(userId, vehicle.id);
        }

        // Form data is stored as a JSON string in flash, so we need to parse it
        let formData = {};
        const formDataFlash = req.flash('formData');
        
        if (formDataFlash.length) {
            try {
                formData = JSON.parse(formDataFlash[0]);
            } catch {
                formData = {};
            }
        }

        res.render('vehicles/detail', {
            title: vehicle.name,
            vehicle,
            user: req.session?.user || null,
            currentSort,
            reviews: reviewStats.reviews,
            totalReviews: reviewStats.totalReviews,
            averageRating: reviewStats.averageRating,
            ratingCounts: reviewStats.ratingCounts,
            ratingPercentages: reviewStats.ratingPercentages,
            formData: formData,
            isLoggedIn: !!userId,
            isFavorite: isFavoriteStatus
            // Flash messages are handled globally by header.ejs
        });
    } catch (error) {
        next(error);
    }
};

export { vehiclesPage, vehicleDetailPage };
