import db from '../db.js';

/**
 * Get all service requests
 */
const getAllServiceRequests = async () => {

    const query = `
        SELECT
            sr.*,
            st.name AS service_type_name,
            u.name AS customer_name,
            v.name AS vehicle_name
        FROM service_requests sr
        JOIN users u ON u.id = sr.user_id
        JOIN service_types st ON st.id = sr.service_type_id
        LEFT JOIN vehicles v ON v.id = sr.vehicle_id
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
        SELECT
            sr.*,
            st.name AS service_type_name,
            u.name AS customer_name,
            v.name AS vehicle_name
        FROM service_requests sr
        JOIN users u ON u.id = sr.user_id
        JOIN service_types st ON st.id = sr.service_type_id
        LEFT JOIN vehicles v ON v.id = sr.vehicle_id
        WHERE sr.id = $1
    `;

    const result = await db.query(query, [requestId]);
    return result.rows[0] || null;
};

/**
 * Get service requests for one user
 */
const getServiceRequestsByUserId = async (userId) => {

    const query = `
        SELECT
            sr.*,
            st.name AS service_type_name,
            v.name AS vehicle_name
        FROM service_requests sr
        JOIN service_types st ON st.id = sr.service_type_id
        LEFT JOIN vehicles v ON v.id = sr.vehicle_id
        WHERE sr.user_id = $1
        ORDER BY sr.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Get all service types
 */
const getAllServiceTypes = async () => {

    const query = `
        SELECT id, name, description
        FROM service_types
        ORDER BY name
    `;

    const result = await db.query(query);
    return result.rows;
};

/**
 * Get service type by ID
 */
const getServiceTypeById = async (typeId) => {

    const query = `
        SELECT id, name, description
        FROM service_types
        WHERE id = $1
    `;

    const result = await db.query(query, [typeId]);
    return result.rows[0] || null;
};

/**
 * Create service request
 */
const createServiceRequest = async (
    userId,
    serviceTypeId,
    vehicleId,
    description
) => {

    const query = `
        INSERT INTO service_requests (
            user_id,
            service_type_id,
            vehicle_id,
            description
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const result = await db.query(
        query,
        [
            userId,
            serviceTypeId,
            vehicleId || null,
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

    const result = await db.query(query, [status, requestId]);
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

    const result = await db.query(query, [notes, requestId]);
    return result.rows[0] || null;
};

/**
 * Update full service request (status + notes)
 */
const updateServiceRequest = async (
    requestId,
    status,
    notes
) => {

    const query = `
        UPDATE service_requests
        SET
            status = $1,
            notes = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
    `;

    const result = await db.query(query, [status, notes, requestId]);
    return result.rows[0] || null;
};

/**
 * Delete service request
 */
const deleteServiceRequest = async (requestId) => {

    const query = `
        DELETE FROM service_requests
        WHERE id = $1
    `;

    const result = await db.query(query, [requestId]);
    return result.rowCount > 0;
};

export {
    getAllServiceRequests,
    getServiceRequestById,
    getServiceRequestsByUserId,
    getAllServiceTypes,
    getServiceTypeById,
    createServiceRequest,
    updateServiceRequestStatus,
    updateServiceRequestNotes,
    updateServiceRequest,
    deleteServiceRequest
};