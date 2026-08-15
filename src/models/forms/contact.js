import db from '../db.js';

/**
 * Inserts a new contact form submission into the database.
 * 
 * @param {string} customer_name - The name of the person contacting
 * @param {string} email - The email address of the person
 * @param {string} phone - The phone number of the person (optional)
 * @param {string} subject - The subject of the contact message
 * @param {string} message - The message content
 * @returns {Promise<Object>} The newly created contact form record
 */
const createContactForm = async (customer_name, email, phone, subject, message) => {
    const query = `
        INSERT INTO contact_form (customer_name, email, phone, subject, message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const result = await db.query(query, [customer_name, email, phone, subject, message]);
    return result.rows[0];
};

/**
 * Retrieves all contact form submissions, ordered by most recent first.
 * Includes status and priority fields.
 * 
 * @returns {Promise<Array>} Array of contact form records
 */
const getAllContactForms = async () => {
    const query = `
        SELECT 
            id, 
            customer_name, 
            email, 
            phone, 
            subject, 
            message, 
            status,
            priority,
            submitted AS created_at,
            created_at,
            updated_at
        FROM contact_form
        ORDER BY submitted DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Retrieves a single contact form submission by ID.
 * 
 * @param {number} id - The ID of the contact form submission
 * @returns {Promise<Object|null>} The contact form record or null if not found
 */
const getContactFormById = async (id) => {
    const query = `
        SELECT 
            id, 
            customer_name, 
            email, 
            phone, 
            subject, 
            message, 
            status,
            priority,
            assigned_to,
            submitted AS created_at,
            created_at,
            updated_at,
            resolved_at
        FROM contact_form
        WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Updates the status of a contact form submission.
 * 
 * @param {number} id - The ID of the contact form submission
 * @param {string} status - The new status ('Received', 'In Progress', 'Resolved', 'Closed')
 * @param {number} assignedTo - The user ID to assign the inquiry to (optional)
 * @returns {Promise<Object|null>} The updated contact form record or null if not found
 */
const updateContactStatus = async (id, status, assignedTo = null) => {
    const query = `
        UPDATE contact_form
        SET 
            status = $1,
            assigned_to = COALESCE($2, assigned_to),
            resolved_at = CASE WHEN $1 = 'Resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
    `;
    const result = await db.query(query, [status, assignedTo, id]);
    return result.rows[0] || null;
};

/**
 * Updates the priority of a contact form submission.
 * 
 * @param {number} id - The ID of the contact form submission
 * @param {string} priority - The new priority ('Low', 'Normal', 'High', 'Urgent')
 * @returns {Promise<Object|null>} The updated contact form record or null if not found
 */
const updateContactPriority = async (id, priority) => {
    const query = `
        UPDATE contact_form
        SET priority = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const result = await db.query(query, [priority, id]);
    return result.rows[0] || null;
};

/**
 * Deletes a contact form submission by ID.
 * 
 * @param {number} id - The ID of the contact form submission
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteContactForm = async (id) => {
    const query = 'DELETE FROM contact_form WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export {
    createContactForm,
    getAllContactForms,
    getContactFormById,
    updateContactStatus,
    updateContactPriority,
    deleteContactForm
};