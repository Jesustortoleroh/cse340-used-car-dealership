import {
    createReview,
    getReviewById,
    updateReview,
    deleteReview,
    canUserModifyReview
} from '../../models/reviews/reviews.js';

import {
    getVehicleById
} from '../../models/vehicles/vehicles.js';

/**
 * Create review
 * Handles the creation of a new review
 */
const processCreateReview = async (req, res) => {
    // Validation is handled by handleValidationErrors middleware
    const { vehicle_id, rating, comment } = req.body;
    const userId = req.session.user.id;

    try {
        await createReview(userId, parseInt(vehicle_id), parseInt(rating), comment);
        req.flash('success', 'Review submitted successfully.');

        const vehicle = await getVehicleById(parseInt(vehicle_id));
        if (!vehicle) {
            return res.redirect('/vehicles');
        }

        res.redirect(`/vehicles/${vehicle.slug}`);
    } catch (error) {
        console.error('Create review error:', error);
        req.flash('error', 'Unable to submit review.');
        return res.redirect(req.get('Referrer') || '/vehicles');
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
            req.flash('error', 'Review not found.');
            return res.redirect('/dashboard');
        }

        if (!canUserModifyReview(req.session.user, review)) {
            req.flash('error', 'You do not have permission to edit this review.');
            return res.redirect('/dashboard');
        }

        // Get form data from flash if available
        let formData = {};
        const formDataFlash = req.flash('formData');
        if (formDataFlash.length) {
            try {
                formData = JSON.parse(formDataFlash[0]);
            } catch {
                formData = {};
            }
        }

        res.render('reviews/edit', {
            title: 'Edit Review',
            review,
            formData
        });
    } catch (error) {
        console.error('Show edit review error:', error);
        req.flash('error', 'Unable to load review.');
        res.redirect('/dashboard');
    }
};

/**
 * Update review
 */
const processUpdateReview = async (req, res) => {
    // Validation is handled by handleValidationErrors middleware
    const reviewId = parseInt(req.params.id);
    const { rating, comment } = req.body;

    try {
        const review = await getReviewById(reviewId);

        if (!review) {
            req.flash('error', 'Review not found.');
            return res.redirect('/dashboard');
        }

        if (!canUserModifyReview(req.session.user, review)) {
            req.flash('error', 'You do not have permission to edit this review.');
            return res.redirect('/dashboard');
        }

        await updateReview(reviewId, parseInt(rating), comment);
        req.flash('success', 'Review updated successfully.');

        const vehicle = await getVehicleById(review.vehicle_id);
        if (!vehicle) {
            return res.redirect('/vehicles');
        }

        res.redirect(`/vehicles/${vehicle.slug}`);
    } catch (error) {
        console.error('Update review error:', error);
        req.flash('error', 'Unable to update review.');
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
            req.flash('error', 'Review not found.');
            return res.redirect('/dashboard');
        }

        if (!canUserModifyReview(req.session.user, review)) {
            req.flash('error', 'You do not have permission to delete this review.');
            return res.redirect('/dashboard');
        }

        const vehicle = await getVehicleById(review.vehicle_id);
        await deleteReview(reviewId);
        req.flash('success', 'Review deleted successfully.');

        if (!vehicle) {
            return res.redirect('/vehicles');
        }

        res.redirect(`/vehicles/${vehicle.slug}`);
    } catch (error) {
        console.error('Delete review error:', error);
        req.flash('error', 'Unable to delete review.');
        res.redirect('/dashboard');
    }
};

export {
    processCreateReview,
    showEditReview,
    processUpdateReview,
    processDeleteReview
};