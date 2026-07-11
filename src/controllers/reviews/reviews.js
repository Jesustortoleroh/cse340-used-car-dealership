import { validationResult } from 'express-validator';

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

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        errors.array().forEach(error => {

            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }

        });

        return res.redirect('back');

    }

    const {
        vehicle_id,
        rating,
        comment
    } = req.body;

    const userId =
        req.session.user.id;

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

        const vehicle =
            await getVehicleById(
                parseInt(vehicle_id)
            );

        if (!vehicle) {

            return res.redirect(
                '/vehicles'
            );

        }

        res.redirect(
            `/vehicles/${vehicle.slug}`
        );

    } catch (error) {

        console.error(
            'Create review error:',
            error
        );

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
const showEditReview = async (
    req,
    res
) => {

    const reviewId =
        parseInt(req.params.id);

    try {

        const review =
            await getReviewById(
                reviewId
            );

        if (!review) {

            if (typeof req.flash === 'function') {

                req.flash(
                    'error',
                    'Review not found.'
                );

            }

            return res.redirect(
                '/dashboard'
            );

        }

        const user =
            req.session.user;

        if (
            !canUserModifyReview(
                user,
                review
            )
        ) {

            if (typeof req.flash === 'function') {

                req.flash(
                    'error',
                    'You do not have permission to edit this review.'
                );

            }

            return res.redirect(
                '/dashboard'
            );

        }

        res.render(
            'reviews/edit',
            {
                title: 'Edit Review',
                review,
                user: req.session?.user || null,
                errors: req.session?.errors || null,
                formData: req.session?.formData || null
            }
        );

        if (req.session) {

            req.session.errors =
                null;

            req.session.formData =
                null;

        }

    } catch (error) {

        console.error(
            'Show edit review error:',
            error
        );

        if (typeof req.flash === 'function') {

            req.flash(
                'error',
                'Unable to load review.'
            );

        }

        res.redirect(
            '/dashboard'
        );

    }

};

/**
 * Update review
 */
const processUpdateReview = async (
    req,
    res
) => {

    const errors =
        validationResult(req);

    if (!errors.isEmpty()) {

        errors.array().forEach(error => {

            if (typeof req.flash === 'function') {

                req.flash(
                    'error',
                    error.msg
                );

            }

        });

        return res.redirect(
            `/reviews/${req.params.id}/edit`
        );

    }

    const reviewId =
        parseInt(req.params.id);

    const {
        rating,
        comment
    } = req.body;

    try {

        const review =
            await getReviewById(
                reviewId
            );

        if (!review) {

            if (typeof req.flash === 'function') {

                req.flash(
                    'error',
                    'Review not found.'
                );

            }

            return res.redirect(
                '/dashboard'
            );

        }

        const user =
            req.session.user;

        if (
            !canUserModifyReview(
                user,
                review
            )
        ) {

            if (typeof req.flash === 'function') {

                req.flash(
                    'error',
                    'You do not have permission to edit this review.'
                );

            }

            return res.redirect(
                '/dashboard'
            );

        }

        await updateReview(
            reviewId,
            parseInt(rating),
            comment
        );

        if (typeof req.flash === 'function') {

            req.flash(
                'success',
                'Review updated successfully.'
            );

        }

        const vehicle =
            await getVehicleById(
                review.vehicle_id
            );

        if (!vehicle) {

            return res.redirect(
                '/vehicles'
            );

        }

        res.redirect(
            `/vehicles/${vehicle.slug}`
        );

    } catch (error) {

        console.error(
            'Update review error:',
            error
        );

        if (typeof req.flash === 'function') {

            req.flash(
                'error',
                'Unable to update review.'
            );

        }

        res.redirect(
            '/dashboard'
        );

    }

};

/**
 * Delete review
 */
const processDeleteReview = async (
    req,
    res
) => {

    const reviewId =
        parseInt(req.params.id);

    try {

        const review =
            await getReviewById(
                reviewId
            );

        if (!review) {

            if (typeof req.flash === 'function') {

                req.flash(
                    'error',
                    'Review not found.'
                );

            }

            return res.redirect(
                '/dashboard'
            );

        }

        const user =
            req.session.user;

        if (
            !canUserModifyReview(
                user,
                review
            )
        ) {

            if (typeof req.flash === 'function') {

                req.flash(
                    'error',
                    'You do not have permission to delete this review.'
                );

            }

            return res.redirect(
                '/dashboard'
            );

        }

        const vehicle =
            await getVehicleById(
                review.vehicle_id
            );

        await deleteReview(
            reviewId
        );

        if (typeof req.flash === 'function') {

            req.flash(
                'success',
                'Review deleted successfully.'
            );

        }

        if (!vehicle) {

            return res.redirect(
                '/vehicles'
            );

        }

        res.redirect(
            `/vehicles/${vehicle.slug}`
        );

    } catch (error) {

        console.error(
            'Delete review error:',
            error
        );

        if (typeof req.flash === 'function') {

            req.flash(
                'error',
                'Unable to delete review.'
            );

        }

        res.redirect(
            '/dashboard'
        );

    }

};

export {
    processCreateReview,
    showEditReview,
    processUpdateReview,
    processDeleteReview
};