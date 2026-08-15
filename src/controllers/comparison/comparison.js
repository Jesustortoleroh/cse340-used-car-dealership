import {
    getVehicleForComparison,
    getAllVehiclesForComparison,
    compareVehicles
} from '../../models/comparison/comparison.js';

/**
 * Show comparison page
 */
const comparisonPage = async (req, res, next) => {
    try {
        const vehicles = await getAllVehiclesForComparison();
        
        res.render('comparison/index', {
            title: 'Compare Vehicles',
            vehicles,
            isLoggedIn: req.session?.userId || false,
            user: req.session?.user || null,
            messages: req.flash()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Compare selected vehicles
 */
const compareVehiclesController = async (req, res, next) => {
    try {
        const { vehicle1, vehicle2, vehicle3 } = req.body;
        
        const vehicleIds = [vehicle1, vehicle2, vehicle3].filter(id => id);
        
        if (vehicleIds.length < 2) {
            req.flash('error', 'Please select at least 2 vehicles to compare.');
            return res.redirect('/compare');
        }

        const results = await compareVehicles(vehicleIds);
        
        if (results.length < 2) {
            req.flash('error', 'Could not find the selected vehicles.');
            return res.redirect('/compare');
        }

        const allVehicles = await getAllVehiclesForComparison();

        res.render('comparison/results', {
            title: 'Vehicle Comparison Results',
            vehicles: results,
            allVehicles,
            isLoggedIn: req.session?.userId || false,
            user: req.session?.user || null,
            messages: req.flash()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get vehicle details for AJAX comparison
 */
const getVehicleDetails = async (req, res, next) => {
    try {
        const vehicleId = parseInt(req.params.vehicleId);
        
        if (!vehicleId) {
            return res.status(400).json({ error: 'Invalid vehicle ID' });
        }

        const vehicle = await getVehicleForComparison(vehicleId);
        
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json(vehicle);
    } catch (error) {
        next(error);
    }
};

export {
    comparisonPage,
    compareVehiclesController,
    getVehicleDetails
};