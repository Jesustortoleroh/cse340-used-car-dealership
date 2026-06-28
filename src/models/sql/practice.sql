-- Practice database tables for assignments
-- Used Car Dealership Project

-- ============================================
-- CONTACT FORM TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contact_form (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS TABLE
-- ============================================

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

-- ============================================
-- REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    UNIQUE(user_id, vehicle_id)
);

-- ============================================
-- SERVICE REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    notes TEXT,
    requested_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- ============================================
-- VEHICLE IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- ============================================
-- SESSION TABLE (para express-session)
-- ============================================

CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- ============================================
-- INDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);
CREATE INDEX IF NOT EXISTS idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_form_email ON contact_form(email);
CREATE INDEX IF NOT EXISTS idx_contact_form_status ON contact_form(status);

-- ============================================
-- VERIFICACIÓN DE TABLAS
-- ============================================

DO $$
DECLARE
    table_name text;
    missing_tables text[] := ARRAY[]::text[];
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'users', 'roles', 'contact_form', 'reviews', 
        'service_requests', 'vehicle_images', 'session'
    ]
    LOOP
        PERFORM 1 FROM information_schema.tables 
        WHERE table_name = table_name AND table_schema = 'public';
        
        IF NOT FOUND THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '⚠️ Tablas faltantes: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ Todas las tablas de práctica existen';
    END IF;
END $$;

-- ============================================
-- ACTUALIZAR ESTADÍSTICAS
-- ============================================

ANALYZE;

SELECT '✅ Database practice tables verification complete' as status;


