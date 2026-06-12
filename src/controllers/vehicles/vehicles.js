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

  res.render('vehicles/vehicles', {
    title: 'Available Vehicles',
    vehicles,
    currentCategory: category || 'All'
  });
};

// Vehicle detail page
const vehicleDetailPage = async (req, res, next) => {
  const vehicleSlug = req.params.slugId;

  const sortBy = req.query.sort || 'feature';

  const vehicle = await getVehicleBySlug(vehicleSlug, sortBy);

  if (!vehicle || Object.keys(vehicle).length === 0) {
    const err = new Error(`Vehicle ${vehicleSlug} not found`);
    err.status = 404;
    return next(err);
  }

  res.render('vehicles/vehicle-detail', {
    title: vehicle.name,
    vehicle,
    currentSort: sortBy
  });
};

export { vehiclesPage, vehicleDetailPage };