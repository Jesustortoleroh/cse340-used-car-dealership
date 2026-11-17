// Import the necessary modules and controllers
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { vehiclesPage, vehicleDetailPage } from './vehicles/vehicles.js';
import { dealersListPage, dealerDetailPage } from './dealers/dealers.js';
import { showContactForm, handleContactSubmission, showContactResponses, showInquiryDetail, updateInquiryStatus, updateInquiryPriority, deleteInquiry } from './forms/contact.js';
import { showRegistrationForm, processRegistration, showAllUsers, showEditAccountForm, processEditAccount, processDeleteAccount } from './forms/registration.js';
import { showLoginForm, processLogin, processLogout, showDashboard } from './forms/login.js';
import { processCreateReview, showEditReview, processUpdateReview, processDeleteReview } from '../controllers/reviews/reviews.js';
import { showServiceRequests, showCreateRequestForm, processCreateRequest, showEditRequestForm, processUpdateRequest, processDeleteRequest } from '../controllers/serviceRequests/serviceRequests.js';
import { requireLogin, requireEmployee, requireOwner } from '../middleware/auth.js';
import { contactValidation, registrationValidation, loginValidation, updateAccountValidation, reviewValidation, serviceRequestValidation } from '../middleware/validation/forms.js';
import { addFavoriteController, removeFavoriteController, favoritesListPage } from '../controllers/favorites/favorites.js';
import { profilePage } from '../controllers/profile/profile.js';
import { comparisonPage, compareVehiclesController, getVehicleDetails } from '../controllers/comparison/comparison.js';
import { showNotifications, getUnreadCountAjax, markAsReadController, markAllAsReadController, deleteNotificationController } from '../controllers/notifications/notifications.js';

const router = Router();

// ============================================
// Asset Injection Middleware
// ============================================

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
    res.addStyle('<link rel="stylesheet" href="/css/reviews.css">');
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

router.use('/favorites', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/favorites.css">');
    next();
});

router.use('/profile', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/profile.css">');
    next();
});

router.use('/notifications', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/notifications.css">');
    next();
});

router.use('/compare', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/comparison.css">');
    next();
});

// ============================================
// Basic Pages
// ============================================
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/test-error', testErrorPage);

// ============================================
// Dealers
// ============================================
router.get('/dealers', dealersListPage);
router.get('/dealers/:dealerSlug', dealerDetailPage);

// ============================================
// Vehicles
// ============================================
router.get('/vehicles', vehiclesPage);
router.get('/vehicles/:slugId', vehicleDetailPage);

// ============================================
// Contact Form (Public)
// ============================================
router.get('/contact', showContactForm);
router.post('/contact', contactValidation, handleContactSubmission);

// ============================================
// Contact Responses (Protected: Staff Only)
// ============================================
router.get('/contact/responses', requireEmployee, showContactResponses);
router.get('/contact/:id', requireEmployee, showInquiryDetail);
router.post('/contact/:id/status', requireEmployee, updateInquiryStatus);
router.post('/contact/:id/priority', requireEmployee, updateInquiryPriority);
router.post('/contact/:id/delete', requireOwner, deleteInquiry);

// ============================================
// Registration (Public)
// ============================================
router.get('/register', showRegistrationForm);
router.post('/register', registrationValidation, processRegistration);

// ============================================
// User Management (Protected: Owner Only)
// ============================================
router.get('/register/list', requireOwner, showAllUsers);
router.get('/register/:id/edit', requireLogin, showEditAccountForm);
router.post('/register/:id/edit', requireLogin, updateAccountValidation, processEditAccount);
router.post('/register/:id/delete', requireOwner, processDeleteAccount);

// ============================================
// Login / Logout
// ============================================
router.get('/login', showLoginForm);
router.post('/login', loginValidation, processLogin);
router.get('/logout', processLogout);

// ============================================
// Dashboard (Protected)
// ============================================
router.get('/dashboard', requireLogin, showDashboard);

// ============================================
// Reviews (Protected)
// ============================================
router.post('/reviews/create', requireLogin, reviewValidation, processCreateReview);
router.get('/reviews/:id/edit', requireLogin, showEditReview);
router.post('/reviews/:id/edit', requireLogin, reviewValidation, processUpdateReview);
router.post('/reviews/:id/delete', requireLogin, processDeleteReview);

// ============================================
// Service Requests (Protected)
// ============================================
router.get('/service-requests', requireLogin, showServiceRequests);
router.get('/service-requests/create', requireLogin, showCreateRequestForm);
router.post('/service-requests/create', requireLogin, serviceRequestValidation, processCreateRequest);
router.get('/service-requests/:id/edit', requireLogin, showEditRequestForm);
router.post('/service-requests/:id/edit', requireLogin, processUpdateRequest);
router.post('/service-requests/:id/delete', requireLogin, processDeleteRequest);
router.get('/service-requests/manage', requireLogin, showServiceRequests);

// ============================================
// Favorites (Protected)
// ============================================
router.get('/favorites', requireLogin, favoritesListPage);
router.post('/favorites/:vehicleId/add', requireLogin, addFavoriteController);
router.post('/favorites/:vehicleId/remove', requireLogin, removeFavoriteController);

// ============================================
// Profile (Protected)
// ============================================
router.get('/profile', requireLogin, profilePage);

// ============================================
// Comparison (Public)
// ============================================
router.get('/compare', comparisonPage);
router.post('/compare', compareVehiclesController);
router.get('/compare/:vehicleId', getVehicleDetails);

// ============================================
// Notifications (Protected)
// ============================================
router.get('/notifications', requireLogin, showNotifications);
router.get('/notifications/unread', requireLogin, getUnreadCountAjax);
router.post('/notifications/:id/read', requireLogin, markAsReadController);
router.post('/notifications/read-all', requireLogin, markAllAsReadController);
router.post('/notifications/:id/delete', requireLogin, deleteNotificationController);

export default router;