-- Practice database tables for assignments
-- Used Car Dealership Project

CREATE TABLE IF NOT EXISTS contact_form (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table for registration system
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ROLE-BASED ACCESS CONTROL TABLES
-- ============================================

/*
==========================
ROLES TABLE
==========================
*/

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*
==========================
ADD ROLE_ID TO USERS TABLE
==========================
*/

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role_id'
    ) THEN

        ALTER TABLE users
        ADD COLUMN role_id INTEGER
        REFERENCES roles(id);

    END IF;
END $$;

/*
==========================
SEED ROLES
==========================
*/

INSERT INTO roles (
    role_name,
    role_description
)
VALUES
(
    'customer',
    'Standard dealership customer account'
),
(
    'employee',
    'Dealership employee account'
),
(
    'owner',
    'Full dealership administration access'
)
ON CONFLICT (role_name)
DO NOTHING;

/*
==========================
SET DEFAULT ROLE
==========================
*/

DO $$
DECLARE
    customer_role_id INTEGER;
BEGIN

    SELECT id
    INTO customer_role_id
    FROM roles
    WHERE role_name = 'customer';

    IF customer_role_id IS NOT NULL THEN

        EXECUTE format(
            'ALTER TABLE users ALTER COLUMN role_id SET DEFAULT %s',
            customer_role_id
        );

    END IF;

END $$;

/*
==========================
UPDATE EXISTING USERS
==========================
*/

DO $$
DECLARE
    customer_role_id INTEGER;
BEGIN

    SELECT id
    INTO customer_role_id
    FROM roles
    WHERE role_name = 'customer';

    IF customer_role_id IS NOT NULL THEN

        UPDATE users
        SET role_id = customer_role_id
        WHERE role_id IS NULL;

    END IF;

END $$;

/*
==========================
REMOVE OLD ROLE COLUMN
==========================
*/

DO $$
BEGIN

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role'
    ) THEN

        ALTER TABLE users
        DROP COLUMN role;

    END IF;

END $$;


