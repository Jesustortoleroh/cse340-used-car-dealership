// Import model functions
import {
    getVehicleBySlug,
    getVehiclesByCategory
} from '../../models/vehicles/vehicles.js';

// Vehicles list page
const vehiclesPage = async (req, res, next) => {
    try {
        const category = req.query.category;

        const vehicles = await getVehiclesByCategory(category);

        res.render('vehicles/list', {
            title: 'Available Vehicles',
            vehicles,
            currentCategory: category || 'All'
        });
    } catch (error) {
        next(error);
    }
};

// Vehicle detail page
const vehicleDetailPage = async (req, res, next) => {
    try {
        const slug = req.params.slugId;

        const vehicle = await getVehicleBySlug(slug);

        if (!vehicle) {
            const err = new Error('Vehicle not found');
            err.status = 404;
            return next(err);
        }

        res.render('vehicles/detail', {
            title: vehicle.name,
            vehicle,
            currentSort: req.query.sort || 'feature'
        });
    } catch (error) {
        next(error);
    }
};

export { vehiclesPage, vehicleDetailPage };
