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
            isLoggedIn: !!req.session?.userId, // Convert to boolean
            user: req.session?.user || null
            // No need to pass messages, header.ejs handles it globally
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

        const selectedIds = [vehicle1, vehicle2, vehicle3].filter(
            id => id !== undefined && id !== null && id !== ''
        );

        if (
            selectedIds.some(
                id =>
                    typeof id !== 'string' ||
                    !/^\d+$/.test(id) ||
                    !Number.isSafeInteger(Number(id)) ||
                    Number(id) <= 0
            )
        ) {
            req.flash('error', 'Please select valid vehicles to compare.');
            return res.redirect('/compare');
        }

        const vehicleIds = selectedIds.map(Number);
        
        if (vehicleIds.length < 2) {
            req.flash('error', 'Please select at least 2 vehicles to compare.');
            return res.redirect('/compare');
        }

        if (new Set(vehicleIds).size !== vehicleIds.length) {
            req.flash('error', 'Please select different vehicles to compare.');
            return res.redirect('/compare');
        }

        const results = await compareVehicles(vehicleIds);
        
        if (results.length < 2) {
            req.flash('error', 'Could not find the selected vehicles.');
            return res.redirect('/compare');
        }

        res.render('comparison/results', {
            title: 'Vehicle Comparison Results',
            vehicles: results,
            isLoggedIn: !!req.session?.userId,
            user: req.session?.user || null
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
        const vehicleId = Number(req.params.vehicleId);

        if (
            !/^\d+$/.test(req.params.vehicleId) ||
            !Number.isSafeInteger(vehicleId) ||
            vehicleId <= 0
        ) {
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