import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Finds a dealership user by email address.
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const findUserByEmail = async (email) => {

    const query = `
        SELECT
            id,
            name,
            email,
            role,
            password,
            created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
    `;

    const result = await db.query(
        query,
        [email]
    );

    return result.rows[0] || null;
};

/**
 * Verifies a password against its bcrypt hash.
 *
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (
    plainPassword,
    hashedPassword
) => {

    return await bcrypt.compare(
        plainPassword,
        hashedPassword
    );
};

export {
    findUserByEmail,
    verifyPassword
};