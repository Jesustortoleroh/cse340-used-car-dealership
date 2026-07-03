import { Router } from 'express';

import {
    showServiceRequests,
    showCreateRequestForm,
    processCreateRequest,
    showEditRequestForm,
    processUpdateRequest,
    processDeleteRequest
} from '../controllers/serviceRequests/serviceRequests.js';

import {
    requireLogin
} from '../middleware/auth.js';

import {
    serviceRequestValidation
} from '../middleware/validation/forms.js';

const router = Router();

/**
 * List requests
 */
router.get(
    '/',
    requireLogin,
    showServiceRequests
);

/**
 * Create form
 */
router.get(
    '/create',
    requireLogin,
    showCreateRequestForm
);

/**
 * Create request
 */
router.post(
    '/create',
    requireLogin,
    serviceRequestValidation,
    processCreateRequest
);

/**
 * Edit form
 */
router.get(
    '/:id/edit',
    requireLogin,
    showEditRequestForm
);

/**
 * Update request
 */
router.post(
    '/:id/edit',
    requireLogin,
    processUpdateRequest
);

/**
 * Delete request
 */
router.post(
    '/:id/delete',
    requireLogin,
    processDeleteRequest
);

export default router;