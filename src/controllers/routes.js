import { Router } from 'express';
import { vehiclesPage, vehicleDetailPage } from './vehicles/vehicles.js';
import { homePage, aboutPage, contactPage, testErrorPage } from './index.js';

// Create router
const router = Router();

/**
 * Routes
 */

// Basic pages
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/contact', contactPage);

//  Vehicles catalog 
router.get('/vehicles', vehiclesPage);

//  Dynamic route 
router.get('/vehicles/:vehicleId', vehicleDetailPage);

//  Test error route
router.get('/test-error', testErrorPage);

export default router;

