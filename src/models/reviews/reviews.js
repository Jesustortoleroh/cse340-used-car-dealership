import db from '../db.js';

/**
 * Get all reviews for a vehicle
 */
const getReviewsByVehicleId = async (vehicleId) => {

    const query = `
        SELECT
            r.id,
            r.rating,
            r.comment,
            r.created_at,

            u.id AS user_id,
            u.name

        FROM reviews r

        JOIN users u
            ON u.id = r.user_id

        WHERE r.vehicle_id = $1

        ORDER BY r.created_at DESC
    `;

    const result = await db.query(
        query,
        [vehicleId]
    );

    return result.rows;
};

/**
 * Get a single review by ID
 */
const getReviewById = async (reviewId) => {

    const query = `
        SELECT
            id,
            user_id,
            vehicle_id,
            rating,
            comment,
            created_at,
            updated_at

        FROM reviews

        WHERE id = $1
    `;

    const result = await db.query(
        query,
        [reviewId]
    );

    return result.rows[0] || null;
};

/**
 * Create a new review
 */
const createReview = async (
    userId,
    vehicleId,
    rating,
    comment
) => {

    const query = `
        INSERT INTO reviews (
            user_id,
            vehicle_id,
            rating,
            comment
        )

        VALUES ($1, $2, $3, $4)

        RETURNING *
    `;

    const result = await db.query(
        query,
        [
            userId,
            vehicleId,
            rating,
            comment
        ]
    );

    return result.rows[0];
};

/**
 * Update an existing review
 */
const updateReview = async (
    reviewId,
    rating,
    comment
) => {

    const query = `
        UPDATE reviews

        SET
            rating = $1,
            comment = $2,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $3

        RETURNING *
    `;

    const result = await db.query(
        query,
        [
            rating,
            comment,
            reviewId
        ]
    );

    return result.rows[0] || null;
};

/**
 * Delete a review
 */
const deleteReview = async (reviewId) => {

    const query = `
        DELETE FROM reviews
        WHERE id = $1
    `;

    const result = await db.query(
        query,
        [reviewId]
    );

    return result.rowCount > 0;
};

/**
 * Get review statistics for a vehicle
 * Returns: reviews, totalReviews, averageRating, ratingCounts, ratingPercentages
 */
const getReviewStats = async (vehicleId) => {

    const reviews = await getReviewsByVehicleId(vehicleId);

    const totalReviews = reviews.length;
    let averageRating = 0;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        averageRating = parseFloat((sum / totalReviews).toFixed(1));

        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
            }
        });
    }

    // Calculate percentages
    const ratingPercentages = {};
    for (let i = 1; i <= 5; i++) {
        ratingPercentages[i] = totalReviews > 0
            ? Math.round((ratingCounts[i] / totalReviews) * 100)
            : 0;
    }

    return {
        reviews,
        totalReviews,
        averageRating,
        ratingCounts,
        ratingPercentages
    };
};

/**
 * Check if a user can edit/delete a review
 */
const canUserModifyReview = (user, review) => {
    if (!user) return false;
    return (
        user.id === review.user_id ||
        user.roleName === 'employee' ||
        user.roleName === 'owner'
    );
};

export {
    getReviewsByVehicleId,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    getReviewStats,
    canUserModifyReview
};