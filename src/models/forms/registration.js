import db from '../db.js';

/**
 * Checks whether an email is already registered.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const emailExists = async (email) => {
    const query = `
        SELECT EXISTS(
            SELECT 1
            FROM users
            WHERE email = $1
        ) AS exists
    `;

    const result = await db.query(query, [email]);

    return result.rows[0].exists;
};

/**
 * Saves a new dealership user.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} hashedPassword
 * @param {string} role
 * @returns {Promise<Object>}
 */
const saveUser = async (
    name,
    email,
    hashedPassword,
    role = 'customer'
) => {
    const query = `
        INSERT INTO users (
            name,
            email,
            password,
            role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            name,
            email,
            role,
            created_at
    `;

    const result = await db.query(query, [
        name,
        email,
        hashedPassword,
        role
    ]);

    return result.rows[0];
};

/**
 * Retrieves all registered users.
 *
 * @returns {Promise<Array>}
 */
const getAllUsers = async () => {
    const query = `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        ORDER BY created_at DESC
    `;

    const result = await db.query(query);

    return result.rows;
};

export {
    emailExists,
    saveUser,
    getAllUsers
};