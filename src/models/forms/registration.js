import db from '../db.js';

/**
 * Checks whether an email is already registered.
 * Uses LOWER() for case-insensitive comparison.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const emailExists = async (email) => {
    const query = `
        SELECT EXISTS(
            SELECT 1
            FROM users
            WHERE LOWER(email) = LOWER($1)
        ) AS exists
    `;

    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

/**
 * Saves a new dealership user.
 * The role_id will be set automatically to the 'customer' role by the DEFAULT constraint.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} hashedPassword
 * @returns {Promise<Object>}
 */
const saveUser = async (name, email, hashedPassword) => {
    const query = `
        INSERT INTO users (
            name,
            email,
            password
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            name,
            email,
            created_at
    `;

    const result = await db.query(query, [
        name,
        email,
        hashedPassword
    ]);

    return result.rows[0];
};

/**
 * Retrieves all registered users with their role information.
 *
 * @returns {Promise<Array>}
 */
const getAllUsers = async () => {
    const query = `
        SELECT
            users.id,
            users.name,
            users.email,
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        ORDER BY users.created_at DESC
    `;

    const result = await db.query(query);
    return result.rows;
};

/**
 * Retrieve a single user by ID with role information.
 *
 * @param {number} id - User ID
 * @returns {Promise<Object|null>}
 */
const getUserById = async (id) => {
    const query = `
        SELECT
            users.id,
            users.name,
            users.email,
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Update a user's name and email.
 *
 * @param {number} id - User ID
 * @param {string} name - New name
 * @param {string} email - New email
 * @returns {Promise<Object|null>}
 */
const updateUser = async (id, name, email) => {
    const query = `
        UPDATE users
        SET name = $1,
            email = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING
            id,
            name,
            email,
            updated_at
    `;

    const result = await db.query(query, [name, email, id]);
    return result.rows[0] || null;
};

/**
 * Delete a user account by ID.
 *
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
const deleteUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export {
    emailExists,
    saveUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};