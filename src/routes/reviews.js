import { Router } from 'express';
import { 
    processCreateReview, 
    showEditReview, 
    processUpdateReview, 
    processDeleteReview 
} from '../controllers/reviews/reviews.js';
import { requireLogin } from '../middleware/auth.js';
import { reviewValidation } from '../middleware/validation/forms.js';

const router = Router();

/**
 * Review routes
 * All routes require user authentication
 */

/**
 * Create a new review
 * POST /reviews/create
 */
router.post('/create', requireLogin, reviewValidation, processCreateReview);

/**
 * Show edit review form
 * GET /reviews/:id/edit
 */
router.get('/:id/edit', requireLogin, showEditReview);

/**
 * Update an existing review
 * POST /reviews/:id/edit
 */
router.post('/:id/edit', requireLogin, reviewValidation, processUpdateReview);

/**
 * Delete a review
 * POST /reviews/:id/delete
 */
router.post('/:id/delete', requireLogin, processDeleteReview);

export default router;