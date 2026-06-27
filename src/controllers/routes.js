import { Router } from 'express';
import { vehiclesPage, vehicleDetailPage } from './vehicles/vehicles.js';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { dealersListPage, dealerDetailPage } from './dealers/dealers.js';
import contactRoutes from './forms/contact.js';

const router = Router();

// Vehicle styles
router.use('/vehicles', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/vehicles.css">');
    next();
});

// Contact styles
router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});

// Basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Dealers
router.get('/dealers', dealersListPage);
router.get('/dealers/:dealerSlug', dealerDetailPage);

// Vehicles
router.get('/vehicles', vehiclesPage);
router.get('/vehicles/:slugId', vehicleDetailPage);

// Contact form routes
router.use('/contact', contactRoutes);

// Test error
router.get('/test-error', testErrorPage);

export default router;
