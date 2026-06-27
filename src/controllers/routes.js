import { Router } from 'express';
import { vehiclesPage, vehicleDetailPage } from './vehicles/vehicles.js';
import { homePage, aboutPage, contactPage, testErrorPage } from './index.js';
import { dealersListPage, dealerDetailPage } from './dealers/dealers.js';

const router = Router();

// Add catalog-specific styles to all catalog routes
router.use('/vehicles', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/vehicles.css">');
    next();
});

// Basic pages
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/contact', contactPage);

// Dealers
router.get('/dealers', dealersListPage);
router.get('/dealers/:dealerSlug', dealerDetailPage);

// Vehicles
router.get('/vehicles', vehiclesPage);
router.get('/vehicles/:slugId', vehicleDetailPage);

// Test error
router.get('/test-error', testErrorPage);

export default router;

