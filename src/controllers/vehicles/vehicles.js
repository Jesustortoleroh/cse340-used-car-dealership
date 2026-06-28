// Import model functions
import {
    getAllVehicles,
    getVehicleBySlug,
    getVehiclesByCategory
} from '../../models/vehicles/vehicles.js';

// Vehicles list page
const vehiclesPage = async (req, res) => {
    const category = req.query.category;

    const vehicles = await getVehiclesByCategory(category);

    res.render('vehicles/list', {
        title: 'Available Vehicles',
        vehicles,
        currentCategory: category || 'All'
    });
};

// Vehicle detail page
const vehicleDetailPage = async (req, res, next) => {
    const vehicleId = req.params.slugId;

    const vehicle = await getVehicleBySlug(vehicleId);

    if (!vehicle) {
        const err = new Error(`Vehicle not found`);
        err.status = 404;
        return next(err);
    }

    res.render('vehicles/detail', {
        title: vehicle.name,
        vehicle
    });
};

export { vehiclesPage, vehicleDetailPage };