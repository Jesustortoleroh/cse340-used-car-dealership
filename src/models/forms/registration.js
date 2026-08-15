import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Hash a password using bcrypt.
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Create a new user in the database.
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} hashedPassword - Pre-hashed password
 * @returns {Promise<Object>} The newly created user record
 */
const createUser = async (name, email, hashedPassword) => {
    // Get default role_id for 'customer'
    const roleQuery = `SELECT id FROM roles WHERE role_name = 'customer'`;
    const roleResult = await db.query(roleQuery);
    const roleId = roleResult.rows[0]?.id || 1;

    const query = `
        INSERT INTO users (name, email, password, role_id, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING id, name, email, created_at
    `;
    const result = await db.query(query, [name, email, hashedPassword, roleId]);
    return result.rows[0];
};

/**
 * Find a user by email address.
 * 
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT id, name, email, password, is_active
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

export {
    hashPassword,
    createUser,
    findUserByEmail
};