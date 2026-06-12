// Import model functions
import { getAllVehicles, getVehicleById, getSortedSpecs, getVehiclesByCategory } from '../../models/vehicles/vehicles.js';

//  Vehicles list page
const vehiclesPage = (req, res) => {
  const category = req.query.category;

  
  const vehicles = getVehiclesByCategory(category);

  res.render('vehicles', {
    title: 'Available Vehicles',
    vehicles: vehicles,
    currentCategory: category || 'All'  
  });
};


//  Vehicle detail page
const vehicleDetailPage = (req, res, next) => {
  const vehicleId = req.params.vehicleId;

  const vehicle = getVehicleById(vehicleId);

  // If vehicle doesn't exist → 404
  if (!vehicle) {
    const err = new Error(`Vehicle ${vehicleId} not found`);
    err.status = 404;
    return next(err);
  }

  // Sorting specs (query param)
  const sortBy = req.query.sort || 'feature';

  const sortedSpecs = getSortedSpecs(vehicle.specs, sortBy);

  res.render('vehicle-detail', {
    title: vehicle.name,
    vehicle: { ...vehicle, specs: sortedSpecs },
    currentSort: sortBy
  });
};

export { vehiclesPage, vehicleDetailPage };
