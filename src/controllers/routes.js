import { Router } from 'express';
import { vehiclesPage, vehicleDetailPage } from './vehicles/vehicles.js';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { dealersListPage, dealerDetailPage } from './dealers/dealers.js';
import contactRoutes from './forms/contact.js';
import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';

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

// Registration styles
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

// Login styles
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
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

// Registration form routes
router.use('/register', registrationRoutes);

// Login form routes
router.use('/login', loginRoutes);

// Logout route
router.get('/logout', processLogout);

// Dashboard route (requires login)
router.get('/dashboard', requireLogin, showDashboard);

// Test error
router.get('/test-error', testErrorPage);

export default router;
