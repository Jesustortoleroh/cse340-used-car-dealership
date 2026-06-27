import db from '../db.js';

/**
 * Saves a new customer inquiry.
 *
 * @param {string} customerName - Customer name
 * @param {string} email - Customer email
 * @param {string} phone - Customer phone number
 * @param {string} subject - Inquiry subject
 * @param {string} message - Inquiry message
 * @returns {Promise<Object>}
 */
const createContactForm = async (
    customerName,
    email,
    phone,
    subject,
    message
) => {
    const query = `
        INSERT INTO contact_form (
            customer_name,
            email,
            phone,
            subject,
            message
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const result = await db.query(query, [
        customerName,
        email,
        phone,
        subject,
        message
    ]);

    return result.rows[0];
};

/**
 * Retrieves all customer inquiries.
 *
 * @returns {Promise<Array>}
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
            submitted
        FROM contact_form
        ORDER BY submitted DESC
    `;

    const result = await db.query(query);

    return result.rows;
};

export {
    createContactForm,
    getAllContactForms
};