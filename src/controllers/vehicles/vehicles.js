import {
    getVehicleBySlug,
    getInventoryFilters,
    getFilteredVehicles,
    updateVehicleTrustDetails
} from '../../models/vehicles/vehicles.js';
import { getReviewStats } from '../../models/reviews/reviews.js';
import { isFavorite } from '../../models/favorites/favorites.js';
import { parseInventoryFilters } from '../../utils/inventoryFilters.js';

/**
 * Get sort label for display
 */
const getSortLabel = (sort) => {
    const labels = {
        price_asc: 'Price: Low to High',
        price_desc: 'Price: High to Low',
        name_asc: 'Name: A to Z',
        name_desc: 'Name: Z to A',
        newest: 'Newest First',
        year_desc: 'Newest Model Year',
        mileage_asc: 'Lowest Mileage'
    };
    return labels[sort] || 'Name: A to Z';
};

/**
 * Vehicles list page
 * Renders the list of available vehicles filtered by category or search term
 */
const vehiclesPage = async (req, res, next) => {
    try {
        const filters = parseInventoryFilters(req.query);
        const { page: requestedPage, ...inventoryFilters } = filters;
        const pageSize = 9;
        const [inventory, { categories, dealers }] = await Promise.all([
            getFilteredVehicles({ ...inventoryFilters, limit: pageSize, page: requestedPage }),
            getInventoryFilters()
        ]);
        const { vehicles, total, page: currentPage } = inventory;
        const pageCount = Math.ceil(total / pageSize);
        const queryParams = {
            ...inventoryFilters,
            category: inventoryFilters.category || 'All',
            minPrice: inventoryFilters.minPrice ?? '',
            maxPrice: inventoryFilters.maxPrice ?? '',
            minYear: inventoryFilters.minYear ?? '',
            maxYear: inventoryFilters.maxYear ?? '',
            maxMileage: inventoryFilters.maxMileage ?? ''
        };
        const buildPageUrl = (page) => {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries({ ...queryParams, page })) {
                if (value !== '' && value !== 'All') {
                    params.set(key, String(value));
                }
            }
            return `/vehicles?${params.toString()}`;
        };

        res.render('vehicles/list', {
            title: inventoryFilters.search
                ? `Search results for "${inventoryFilters.search}"`
                : 'Available Vehicles',
            vehicles,
            categories,
            dealers,
            currentCategory: queryParams.category,
            queryParams,
            sortLabel: getSortLabel(inventoryFilters.sort),
            vehicleCount: total,
            pagination: {
                page: currentPage,
                pageCount,
                start: total ? (currentPage - 1) * pageSize + 1 : 0,
                end: Math.min(currentPage * pageSize, total),
                previousUrl: currentPage > 1 ? buildPageUrl(currentPage - 1) : null,
                nextUrl: currentPage < pageCount ? buildPageUrl(currentPage + 1) : null
            }
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

const processVehicleTrustDetails = async (req, res, next) => {
    try {
        const updatedVehicle = await updateVehicleTrustDetails(req.params.slugId, {
            vin: (req.body.vin || '').trim().toUpperCase(),
            inspectionNotes: (req.body.inspection_notes || '').trim(),
            serviceHistory: (req.body.service_history || '').trim()
        });

        if (!updatedVehicle) {
            const error = new Error('Vehicle not found');
            error.status = 404;
            return next(error);
        }

        req.flash('success', 'Vehicle inspection and history details updated.');
        return res.redirect(`/vehicles/${req.params.slugId}`);
    } catch (error) {
        if (error.code === '23505') {
            req.flash('error', 'That VIN is already assigned to another vehicle.');
            return res.redirect(`/vehicles/${req.params.slugId}`);
        }
        return next(error);
    }
};

export { vehiclesPage, vehicleDetailPage, processVehicleTrustDetails };
