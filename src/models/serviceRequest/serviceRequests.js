import db from '../db.js';

/**
 * Get all service requests
 */
const getAllServiceRequests = async () => {

    const query = `
        SELECT
            sr.*,

            u.name AS customer_name,

            v.name AS vehicle_name

        FROM service_requests sr

        JOIN users u
            ON u.id = sr.user_id

        LEFT JOIN vehicles v
            ON v.id = sr.vehicle_id

        ORDER BY sr.created_at DESC
    `;

    const result = await db.query(query);

    return result.rows;
};

/**
 * Get a service request by ID
 */
const getServiceRequestById = async (requestId) => {

    const query = `
        SELECT *
        FROM service_requests
        WHERE id = $1
    `;

    const result = await db.query(
        query,
        [requestId]
    );

    return result.rows[0] || null;
};

/**
 * Get service requests for one user
 */
const getServiceRequestsByUserId = async (
    userId
) => {

    const query = `
        SELECT
            sr.*,

            v.name AS vehicle_name

        FROM service_requests sr

        LEFT JOIN vehicles v
            ON v.id = sr.vehicle_id

        WHERE sr.user_id = $1

        ORDER BY sr.created_at DESC
    `;

    const result = await db.query(
        query,
        [userId]
    );

    return result.rows;
};

/**
 * Create service request
 */
const createServiceRequest = async (
    userId,
    vehicleId,
    serviceType,
    description
) => {

    const query = `
        INSERT INTO service_requests (
            user_id,
            vehicle_id,
            service_type,
            description
        )

        VALUES ($1, $2, $3, $4)

        RETURNING *
    `;

    const result = await db.query(
        query,
        [
            userId,
            vehicleId || null,
            serviceType,
            description
        ]
    );

    return result.rows[0];
};

/**
 * Update request status
 */
const updateServiceRequestStatus = async (
    requestId,
    status
) => {

    const query = `
        UPDATE service_requests

        SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING *
    `;

    const result = await db.query(
        query,
        [
            status,
            requestId
        ]
    );

    return result.rows[0] || null;
};

/**
 * Update notes
 */
const updateServiceRequestNotes = async (
    requestId,
    notes
) => {

    const query = `
        UPDATE service_requests

        SET
            notes = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING *
    `;

    const result = await db.query(
        query,
        [
            notes,
            requestId
        ]
    );

    return result.rows[0] || null;
};

/**
 * Delete service request
 */
const deleteServiceRequest = async (
    requestId
) => {

    const query = `
        DELETE FROM service_requests
        WHERE id = $1
    `;

    const result = await db.query(
        query,
        [requestId]
    );

    return result.rowCount > 0;
};

export {
    getAllServiceRequests,
    getServiceRequestById,
    getServiceRequestsByUserId,
    createServiceRequest,
    updateServiceRequestStatus,
    updateServiceRequestNotes,
    deleteServiceRequest
};