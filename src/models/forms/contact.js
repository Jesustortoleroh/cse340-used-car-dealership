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
        INSERT INTO contact_form (customer_name, email, phone, subject, message, status)
        VALUES ($1, $2, $3, $4, $5, 'Received')
        RETURNING *
    `;
    const result = await db.query(query, [customer_name, email, phone, subject, message]);
    return result.rows[0];
};

/**
 * Retrieves all contact form submissions, ordered by most recent first.
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
            submitted AS created_at
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
            submitted AS created_at
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
 * @returns {Promise<Object|null>} The updated contact form record or null if not found
 */
const updateContactStatus = async (id, status) => {
    const query = `
        UPDATE contact_form
        SET status = $1
        WHERE id = $2
        RETURNING *
    `;
    const result = await db.query(query, [status, id]);
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

/**
 * Updates the priority of a contact form submission (opcional).
 * 
 * @param {number} id - The ID of the contact form submission
 * @param {string} priority - The new priority ('Low', 'Normal', 'High', 'Urgent')
 * @returns {Promise<Object|null>} The updated contact form record or null if not found
 */
const updateContactPriority = async (id, priority) => {
    const query = `
        UPDATE contact_form
        SET priority = $1
        WHERE id = $2
        RETURNING *
    `;
    const result = await db.query(query, [priority, id]);
    return result.rows[0] || null;
};

// ⭐ EXPORTAR TODAS LAS FUNCIONES
export {
    createContactForm,
    getAllContactForms,
    getContactFormById,
    updateContactStatus,
    updateContactPriority,
    deleteContactForm
};