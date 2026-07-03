import { validationResult } from 'express-validator';
import { createReview, getReviewById, updateReview, deleteReview } from '../../models/reviews/reviews.js';

/**
 * Create review
 */
const processCreateReview = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });

        return res.redirect('back');
    }

    const { vehicle_id, rating, comment } = req.body;

    const userId = req.session.user.id;

    try {

        await createReview(
        userId,
        parseInt(vehicle_id),
        parseInt(rating),
        comment
     );

        if (typeof req.flash === 'function') {
            req.flash(
                'success',
                'Review submitted successfully.'
            );
        }

        res.redirect('back');

    } catch (error) {

        console.error('Create review error:', error);

        if (typeof req.flash === 'function') {
            req.flash(
                'error',
                'Unable to submit review.'
            );
        }

        return res.redirect(
        req.get('Referrer') || '/vehicles'
);
    }
};

/**
 * Show edit review form
 */
const showEditReview = async (req, res) => {

    const reviewId = parseInt(req.params.id);

    try {

        const review = await getReviewById(reviewId);

        if (!review) {
            req.flash?.('error', 'Review not found.');
            return res.redirect('/dashboard');
        }

        if (
            review.user_id !== req.session.user.id &&
            req.session.user.roleName !== 'owner'
        ) {
            req.flash?.(
                'error',
                'You do not have permission to edit this review.'
            );

            return res.redirect('/dashboard');
        }

        res.render('reviews/edit', {
            title: 'Edit Review',
            review
        });

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to load review.'
        );

        res.redirect('/dashboard');
    }
};

/**
 * Update review
 */
const processUpdateReview = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        errors.array().forEach(error => {
            req.flash?.('error', error.msg);
        });

        return res.redirect(
            `/reviews/${req.params.id}/edit`
        );
    }

    const reviewId = parseInt(req.params.id);

    const {
        rating,
        comment
    } = req.body;

    try {

        const review = await getReviewById(reviewId);

        if (!review) {
            req.flash?.('error', 'Review not found.');
            return res.redirect('/dashboard');
        }

        if (
            review.user_id !== req.session.user.id &&
            req.session.user.roleName !== 'owner'
        ) {
            req.flash?.(
                'error',
                'You do not have permission to edit this review.'
            );

            return res.redirect('/dashboard');
        }

        await updateReview(
        reviewId,
        parseInt(rating),
        comment
);

        req.flash?.(
            'success',
            'Review updated successfully.'
        );

        res.redirect('/dashboard');

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to update review.'
        );

        res.redirect('/dashboard');
    }
};

/**
 * Delete review
 */
const processDeleteReview = async (req, res) => {

    const reviewId = parseInt(req.params.id);

    try {

        const review = await getReviewById(reviewId);

        if (!review) {
            req.flash?.('error', 'Review not found.');
            return res.redirect('/dashboard');
        }

        const canDelete =
            review.user_id === req.session.user.id ||
            req.session.user.roleName === 'employee' ||
            req.session.user.roleName === 'owner';

        if (!canDelete) {
            req.flash?.(
                'error',
                'You do not have permission to delete this review.'
            );

            return res.redirect('/dashboard');
        }

        await deleteReview(reviewId);

        req.flash?.(
            'success',
            'Review deleted successfully.'
        );

        res.redirect('/dashboard');

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to delete review.'
        );

        res.redirect('/dashboard');
    }
};

export { processCreateReview, showEditReview, processUpdateReview, processDeleteReview };