// Import the necessary modules and controllers
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { vehiclesPage, vehicleDetailPage } from './vehicles/vehicles.js';
import { dealersListPage, dealerDetailPage } from './dealers/dealers.js';
import { showContactForm, handleContactSubmission, showContactResponses, showInquiryDetail, updateInquiryStatus, deleteInquiry } from './forms/contact.js';
import { showRegistrationForm, processRegistration, showAllUsers, showEditAccountForm, processEditAccount, processDeleteAccount } from './forms/registration.js';
import { showLoginForm, processLogin, processLogout, showDashboard } from './forms/login.js';
import reviewsRoutes from '../routes/reviews.js';
import { requireLogin } from '../middleware/auth.js';
import { contactValidation, registrationValidation, loginValidation, updateAccountValidation } from '../middleware/validation/forms.js';
import serviceRequestsRoutes from '../routes/serviceRequests.js';




const router = Router();


// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});


router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});

router.use('/dealers', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/dealers.css">');
    next();
});

router.use('/vehicles', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/vehicles.css">');
    next();
});

router.use('/dashboard', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/dashboard.css">');
    next();
});

router.use('/reviews', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/reviews.css">');
    next();
});

router.use('/service-requests', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/serviceRequests.css">');
    next();
});



// Basic Pages
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/test-error', testErrorPage);


// Dealers routes
router.get('/dealers', dealersListPage);
router.get('/dealers/:dealerSlug', dealerDetailPage);

// Vehicles routes
router.get( '/vehicles', vehiclesPage );
router.get( '/vehicles/:slugId', vehicleDetailPage);

// Contact form routes
router.get( '/contact', showContactForm );
router.post( '/contact', contactValidation, handleContactSubmission );
router.get( '/contact/responses', requireLogin, showContactResponses );
router.get( '/contact/:id', requireLogin, showInquiryDetail );
router.post( '/contact/:id/status', requireLogin, updateInquiryStatus);
router.post( '/contact/:id/delete', requireLogin, deleteInquiry );


// Registration routes
router.get( '/register', showRegistrationForm );
router.post( '/register', registrationValidation, processRegistration );
router.get( '/register/list', requireLogin, showAllUsers );
router.get( '/register/:id/edit', requireLogin, showEditAccountForm );
router.post( '/register/:id/edit', requireLogin, updateAccountValidation, processEditAccount);
router.post( '/register/:id/delete', requireLogin, processDeleteAccount );


// Login routes
router.get( '/login', showLoginForm );
router.post( '/login', loginValidation, processLogin );
router.get( '/logout', processLogout);
router.get( '/dashboard', requireLogin, showDashboard );

// Reviews routes
router.use( '/reviews', reviewsRoutes);

// Service Requests routes
router.use( '/service-requests', serviceRequestsRoutes );

export default router;