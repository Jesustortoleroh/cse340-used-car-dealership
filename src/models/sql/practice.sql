-- ============================================
-- PRACTICE DATABASE TABLES FOR USED CAR DEALERSHIP
-- ============================================
-- This file accumulates changes from multiple assignments
-- Version: 2.0 - Enhanced with security and best practices

BEGIN;

-- ============================================
-- 1. CONTACT FORM TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_form (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL CHECK (length(customer_name) >= 2),
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(20) CHECK (phone ~ '^[0-9+\-() ]+$'),
    subject VARCHAR(255) NOT NULL CHECK (length(subject) >= 3),
    message TEXT NOT NULL CHECK (length(message) >= 10),
    status VARCHAR(50) DEFAULT 'Received' CHECK (status IN ('Received', 'In Progress', 'Resolved', 'Closed')),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_form(status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_form(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_form(email);
CREATE INDEX IF NOT EXISTS idx_contact_assigned_to ON contact_form(assigned_to);

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (length(name) >= 2),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password VARCHAR(255) NOT NULL CHECK (length(password) >= 60),
    profile_image VARCHAR(255),
    avatar_style VARCHAR(50),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL CHECK (role_name IN ('customer', 'employee', 'owner')),
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. ADD ROLE_ID TO USERS
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role_id'
    ) THEN
        ALTER TABLE users
        ADD COLUMN role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- ============================================
-- 5. SEED ROLES
-- ============================================
INSERT INTO roles (role_name, role_description) VALUES
('customer', 'Standard dealership customer account'),
('employee', 'Dealership employee account'),
('owner', 'Full dealership administration access')
ON CONFLICT (role_name) DO NOTHING;

-- ============================================
-- 6. SET DEFAULT ROLE AND UPDATE EXISTING
-- ============================================
DO $$
DECLARE
    customer_role_id INTEGER;
BEGIN
    SELECT id INTO customer_role_id FROM roles WHERE role_name = 'customer';
    IF customer_role_id IS NOT NULL THEN
        EXECUTE format('ALTER TABLE users ALTER COLUMN role_id SET DEFAULT %s', customer_role_id);
        UPDATE users SET role_id = customer_role_id WHERE role_id IS NULL;
        ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;
    END IF;
END $$;

-- ============================================
-- 7. REMOVE OLD ROLE COLUMN
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users DROP COLUMN role;
    END IF;
END $$;

-- ============================================
-- 8. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL CHECK (length(comment) >= 5),
    is_flagged BOOLEAN DEFAULT false,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vehicle_id)
);

-- ============================================
-- 9. SERVICE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type_id INTEGER NOT NULL REFERENCES service_types(id),
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    description TEXT NOT NULL CHECK (length(description) >= 10),
    status VARCHAR(50) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'In Progress', 'Completed', 'Cancelled', 'Scheduled')),
    notes TEXT,
    requested_date DATE DEFAULT CURRENT_DATE,
    scheduled_date DATE,
    completed_date DATE,
    estimated_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (
        (scheduled_date IS NULL OR scheduled_date >= CURRENT_DATE) AND
        (completed_date IS NULL OR completed_date >= requested_date)
    )
);

-- ============================================
-- 10. VEHICLE IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 11. SESSION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- ============================================
-- 12. SERVICE TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    estimated_duration INTERVAL,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vehicle_id)
);

-- ============================================
-- 14. VEHICLE SPECS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_specs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vehicle_id, feature)
);

-- ============================================
-- 15. DEALERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dealers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(20) CHECK (phone ~ '^[0-9+\-() ]+$'),
    email VARCHAR(150) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    image_url VARCHAR(255),
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 16. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_service_requests_user ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_vehicle ON service_requests(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vehicle ON favorites(vehicle_id);

-- ============================================
-- 17. TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'reviews', 'service_requests', 'vehicle_images', 'vehicle_specs', 'dealers', 'contact_form', 'service_types')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- ============================================
-- 18. DATA VALIDATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION validate_vehicle_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure price is positive
    IF NEW.price <= 0 THEN
        RAISE EXCEPTION 'Vehicle price must be positive';
    END IF;
    
    -- Ensure year is reasonable
    IF NEW.year < 1900 OR NEW.year > EXTRACT(YEAR FROM CURRENT_DATE) + 1 THEN
        RAISE EXCEPTION 'Invalid vehicle year';
    END IF;
    
    -- Ensure mileage is not negative
    IF NEW.mileage < 0 THEN
        RAISE EXCEPTION 'Mileage cannot be negative';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_vehicle_data_trigger ON vehicles;
CREATE TRIGGER validate_vehicle_data_trigger
BEFORE INSERT OR UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION validate_vehicle_data();

COMMIT;


