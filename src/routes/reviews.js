import { Router } from 'express';
import { processCreateReview, showEditReview, processUpdateReview, processDeleteReview } from '../controllers/reviews/reviews.js';
import { requireLogin } from '../middleware/auth.js';
import { reviewValidation} from '../middleware/validation/forms.js';

const router = Router();

/**
 * Create review
 */
router.post( '/create', requireLogin, reviewValidation, processCreateReview );

/**
 * Show edit form
 */
router.get( '/:id/edit', requireLogin, showEditReview );

/**
 * Update review
 */
router.post( '/:id/edit', requireLogin, reviewValidation, processUpdateReview );

/**
 * Delete review
 */
router.post( '/:id/delete', requireLogin, processDeleteReview );

export default router;