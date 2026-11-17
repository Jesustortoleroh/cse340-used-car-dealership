import { randomBytes } from 'node:crypto';
import db from '../db.js';
import { hashPassword } from './registration.js';

const userColumns = `
    u.id,
    u.name,
    u.email,
    u.profile_image,
    u.avatar_style,
    u.last_login,
    u.is_active,
    u.created_at,
    r.role_name AS "roleName"
`;

const ensureSocialAuthSchema = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS oauth_identities (
            provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'github')),
            provider_user_id VARCHAR(255) NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            email_verified BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (provider, provider_user_id)
        )
    `);
};

const findOrCreateSocialUser = async (identity, retryOnConflict = true) => {
    const client = await db.connect();
    let transactionStarted = false;

    try {
        await client.query('BEGIN');
        transactionStarted = true;

        const linkedUser = await client.query(
            `
                SELECT ${userColumns}
                FROM oauth_identities oi
                JOIN users u ON u.id = oi.user_id
                JOIN roles r ON r.id = u.role_id
                WHERE oi.provider = $1 AND oi.provider_user_id = $2
                FOR UPDATE OF u
            `,
            [identity.provider, identity.providerUserId]
        );

        if (linkedUser.rows[0]) {
            await client.query('COMMIT');
            const user = linkedUser.rows[0];
            return user.is_active === false
                ? { error: 'Your account has been deactivated. Please contact support.' }
                : { user };
        }

        const email = typeof identity.email === 'string' ? identity.email.trim().toLowerCase() : '';
        const isValidEmail =
            identity.emailVerified === true &&
            email.length <= 255 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValidEmail) {
            await client.query('COMMIT');
            return { error: 'A verified email address is required to sign in with this provider.' };
        }

        const existingUser = await client.query(
            `
                SELECT ${userColumns}
                FROM users u
                JOIN roles r ON r.id = u.role_id
                WHERE LOWER(u.email) = LOWER($1)
                LIMIT 1
                FOR UPDATE OF u
            `,
            [email]
        );

        if (existingUser.rows[0]) {
            const user = existingUser.rows[0];

            if (user.is_active === false) {
                await client.query('COMMIT');
                return { error: 'Your account has been deactivated. Please contact support.' };
            }

            await client.query(
                `
                    INSERT INTO oauth_identities (provider, provider_user_id, user_id, email)
                    VALUES ($1, $2, $3, $4)
                `,
                [identity.provider, identity.providerUserId, user.id, email]
            );
            await client.query('COMMIT');
            return { user };
        }

        const roleResult = await client.query(
            `SELECT id FROM roles WHERE role_name = 'customer'`
        );

        if (!roleResult.rows[0]) {
            throw new Error('The customer role is missing from the database');
        }

        const candidateName = typeof identity.name === 'string' ? identity.name.trim().slice(0, 255) : '';
        const emailName = email.split('@')[0].slice(0, 255);
        const name = candidateName.length >= 2 ? candidateName : emailName.length >= 2 ? emailName : 'Customer';
        const profileImage =
            typeof identity.profileImage === 'string' && identity.profileImage.length <= 255
                ? identity.profileImage
                : null;
        const password = await hashPassword(randomBytes(32).toString('base64url'));
        const newUserResult = await client.query(
            `
                INSERT INTO users (name, email, password, role_id, profile_image, is_active)
                VALUES ($1, $2, $3, $4, $5, true)
                RETURNING id, name, email, profile_image, avatar_style, last_login, is_active, created_at
            `,
            [name, email, password, roleResult.rows[0].id, profileImage]
        );
        const user = { ...newUserResult.rows[0], roleName: 'customer' };

        await client.query(
            `
                INSERT INTO oauth_identities (provider, provider_user_id, user_id, email)
                VALUES ($1, $2, $3, $4)
            `,
            [identity.provider, identity.providerUserId, user.id, email]
        );
        await client.query('COMMIT');
        return { user };
    } catch (error) {
        if (transactionStarted) {
            await client.query('ROLLBACK');
        }

        if (error.code !== '23505' || !retryOnConflict) {
            throw error;
        }
    } finally {
        client.release();
    }

    return findOrCreateSocialUser(identity, false);
};

export { ensureSocialAuthSchema, findOrCreateSocialUser };
