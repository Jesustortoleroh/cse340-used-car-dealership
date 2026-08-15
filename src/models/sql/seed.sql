-- ============================================
-- SEED FILE FOR USED CAR DEALERSHIP
-- ============================================
-- This file creates tables and inserts all initial data
-- Version: 2.0 - Improved with security, indexes, and constraints

BEGIN;

-- ============================================
-- 1. DROP EXISTING TABLES (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS vehicle_images CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS vehicle_specs CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS contact_form CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;

-- ============================================
-- 2. CREATE TABLES WITH ENHANCED SECURITY
-- ============================================

-- 1. Roles table (no dependencies)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL 
        CHECK (role_name IN ('customer', 'employee', 'owner')),
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users table (depends on roles)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL 
        CHECK (length(name) >= 2),
    email VARCHAR(255) UNIQUE NOT NULL 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password VARCHAR(255) NOT NULL 
        CHECK (length(password) >= 60),
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    profile_image VARCHAR(255),
    avatar_style VARCHAR(50),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Categories table (no dependencies)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Dealers table (no dependencies)
CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(20) CHECK (phone ~ '^[0-9+\-() ]+$'),
    email VARCHAR(150) UNIQUE NOT NULL 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    image_url VARCHAR(255),
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vehicles table (depends on categories and dealers)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    dealer_id INTEGER REFERENCES dealers(id) ON DELETE SET NULL,
    year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    mileage INTEGER CHECK (mileage >= 0),
    transmission VARCHAR(50) CHECK (transmission IN ('Automatic', 'Manual', 'CVT', 'Semi-Automatic')),
    fuel_type VARCHAR(50) CHECK (fuel_type IN ('Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid')),
    color VARCHAR(50),
    condition VARCHAR(50) CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Needs Work')),
    featured BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 6. Listings table (depends on vehicles and dealers)
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    dealer_id INTEGER NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    availability VARCHAR(50) DEFAULT 'Available' 
        CHECK (availability IN ('Available', 'Sold', 'Reserved', 'In Transit')),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vehicle_id, dealer_id)
);

-- 7. Vehicle specs table (depends on vehicles)
CREATE TABLE vehicle_specs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vehicle_id, feature)
);

-- 8. Vehicle images table (depends on vehicles)
CREATE TABLE vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Favorites table (depends on users and vehicles)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vehicle_id)
);

-- 10. Reviews table (depends on users and vehicles)
CREATE TABLE reviews (
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

-- 11. Service types table (no dependencies)
CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    estimated_duration INTERVAL,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Service requests table (depends on users, service_types, vehicles)
CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type_id INTEGER NOT NULL REFERENCES service_types(id),
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    description TEXT NOT NULL CHECK (length(description) >= 10),
    status VARCHAR(50) DEFAULT 'Submitted' 
        CHECK (status IN ('Submitted', 'In Progress', 'Completed', 'Cancelled', 'Scheduled')),
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

-- 13. Contact form table (depends on users for assigned_to)
CREATE TABLE contact_form (
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

-- 14. Session table (no dependencies)
CREATE TABLE session (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_vehicles_category_id ON vehicles(category_id);
CREATE INDEX idx_vehicles_dealer_id ON vehicles(dealer_id);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_available ON vehicles(available) WHERE available = true;
CREATE INDEX idx_vehicles_featured ON vehicles(featured) WHERE featured = true;

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_vehicle_id ON favorites(vehicle_id);

CREATE INDEX idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_vehicle_id ON service_requests(vehicle_id);

CREATE INDEX idx_contact_form_email ON contact_form(email);
CREATE INDEX idx_contact_form_status ON contact_form(status);

CREATE INDEX idx_listings_dealer_id ON listings(dealer_id);
CREATE INDEX idx_listings_vehicle_id ON listings(vehicle_id);
CREATE INDEX idx_listings_availability ON listings(availability);

-- ============================================
-- 4. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_form_updated_at BEFORE UPDATE ON contact_form
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. CREATE VIEWS FOR ANALYTICS
-- ============================================

CREATE VIEW vehicle_stats AS
SELECT 
    v.id,
    v.name,
    v.slug,
    v.price,
    v.year,
    COUNT(DISTINCT r.id) AS review_count,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(DISTINCT f.user_id) AS favorite_count,
    COUNT(DISTINCT l.dealer_id) AS dealer_count
FROM vehicles v
LEFT JOIN reviews r ON v.id = r.vehicle_id
LEFT JOIN favorites f ON v.id = f.vehicle_id
LEFT JOIN listings l ON v.id = l.vehicle_id
WHERE v.available = true
GROUP BY v.id, v.name, v.slug, v.price, v.year;

CREATE VIEW user_activity AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role_id,
    r.role_name,
    COUNT(DISTINCT f.vehicle_id) AS favorites_count,
    COUNT(DISTINCT rev.id) AS reviews_count,
    COUNT(DISTINCT sr.id) AS service_requests_count,
    u.last_login,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN reviews rev ON u.id = rev.user_id
LEFT JOIN service_requests sr ON u.id = sr.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email, u.role_id, r.role_name, u.last_login, u.created_at;

CREATE VIEW dealer_performance AS
SELECT 
    d.id,
    d.name,
    d.slug,
    d.location,
    d.rating,
    COUNT(DISTINCT l.vehicle_id) AS vehicle_count,
    COUNT(DISTINCT sr.id) AS service_requests_count,
    COUNT(DISTINCT cf.id) AS inquiries_count
FROM dealers d
LEFT JOIN listings l ON d.id = l.dealer_id
LEFT JOIN vehicles v ON l.vehicle_id = v.id
LEFT JOIN service_requests sr ON v.id = sr.vehicle_id
LEFT JOIN contact_form cf ON d.email = cf.email
WHERE d.is_featured = true OR d.rating >= 4.0
GROUP BY d.id, d.name, d.slug, d.location, d.rating
ORDER BY d.rating DESC, vehicle_count DESC;

-- ============================================
-- 6. INSERT DATA
-- ============================================

-- Insert roles
INSERT INTO roles (role_name, role_description) VALUES
('customer', 'Standard dealership customer account with browsing and review capabilities'),
('employee', 'Dealership employee account with management access'),
('owner', 'Full dealership administration access with all permissions')
ON CONFLICT (role_name) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, slug, icon, description) VALUES
('Car', 'car', '🚗', 'Standard passenger vehicles including sedans, coupes, and hatchbacks'),
('SUV', 'suv', '🚙', 'Sport Utility Vehicles with off-road capability and spacious interiors'),
('Truck', 'truck', '🚛', 'Pickup trucks for work and heavy-duty tasks'),
('Van', 'van', '🚐', 'Vans and minivans for family and commercial use'),
('Luxury', 'luxury', '👑', 'Premium vehicles with high-end features and performance'),
('Electric', 'electric', '⚡', 'Electric vehicles with zero emissions and modern technology'),
('Hybrid', 'hybrid', '🌿', 'Vehicles combining electric and gasoline power')
ON CONFLICT (name) DO NOTHING;

-- Insert dealers
INSERT INTO dealers (name, slug, location, phone, email, image_url, description, rating, is_featured) VALUES
('AutoWorld Motors', 'autoworld-motors', 'New York, NY', '123-456-7890', 'info@autoworld.com', '/images/dealers/autoworld.jpg', 'Premier auto dealership serving the New York area with quality vehicles and exceptional service.', 4.8, true),
('City Auto Sales', 'city-auto-sales', 'Dallas, TX', '555-666-7777', 'contact@cityauto.com', '/images/dealers/city-auto.jpg', 'Trusted dealership in Texas offering a wide selection of pre-owned vehicles.', 4.5, false),
('Elite Motors', 'elite-motors', 'Miami, FL', '888-999-0000', 'elite@motors.com', '/images/dealers/elite-motors.jpg', 'Luxury and exotic vehicles in the heart of Miami.', 4.9, true),
('Prime Cars', 'prime-cars', 'Los Angeles, CA', '222-333-4444', 'sales@primecars.com', '/images/dealers/prime-cars.jpg', 'Quality used cars with full inspection and warranty in California.', 4.6, false),
('Atlantic Auto Center', 'atlantic-auto-center', 'Virginia Beach, VA', '666-777-8888', 'sales@atlanticauto.com', '/images/dealers/atlantic-auto.jpg', 'Family-owned dealership with exceptional customer service in Virginia.', 4.7, true),
('Blue Sky Automotive', 'blue-sky-automotive', 'Salt Lake City, UT', '801-555-2002', 'sales@blueskyauto.com', '/images/dealers/blue-sky.jpg', 'Mountain region dealership with off-road and outdoor adventure vehicles.', 4.4, false),
('Golden State Cars', 'golden-state-cars', 'San Francisco, CA', '123-987-4560', 'sales@goldenstatecars.com', '/images/dealers/golden-state.jpg', 'Californias premier dealership for eco-friendly and electric vehicles.', 4.3, false),
('Metro Auto Mall', 'metro-auto-mall', 'Chicago, IL', '312-555-6006', 'contact@metroautomall.com', '/images/dealers/metro-auto.jpg', 'Midwests largest indoor auto mall with 30 dealers under one roof.', 4.2, false),
('Northstar Motors', 'northstar-motors', 'Minneapolis, MN', '999-000-1111', 'info@northstarmotors.com', '/images/dealers/northstar.jpg', 'Northern region dealership specializing in all-weather vehicles.', 4.1, false),
('Sunshine Auto Group', 'sunshine-auto-group', 'Phoenix, AZ', '111-222-3333', 'contact@sunshineauto.com', '/images/dealers/sunshine.jpg', 'Southwest dealership with a large inventory of trucks and SUVs.', 4.0, false)
ON CONFLICT (slug) DO NOTHING;

-- Insert vehicles
INSERT INTO vehicles (name, slug, description, price, category_id, dealer_id, year, mileage, transmission, fuel_type, color, condition, featured, available) VALUES
('Toyota Corolla 2020', 'toyota-corolla-2020', 'Reliable compact car with excellent fuel economy and modern safety features. Perfect for daily commuting.', 12000.00, 1, 1, 2020, 35000, 'Automatic', 'Gasoline', 'Red', 'Excellent', true, true),
('Ford Explorer 2019', 'ford-explorer-2019', 'Spacious SUV perfect for families with three rows of seating and powerful V6 engine.', 18500.00, 2, 2, 2019, 28000, 'Automatic', 'Gasoline', 'Black', 'Good', true, true),
('Honda Civic 2021', 'honda-civic-2021', 'Modern sedan with great handling, turbocharged engine, and advanced tech features.', 14300.00, 1, 3, 2021, 15000, 'Manual', 'Gasoline', 'Blue', 'Excellent', false, true),
('Chevrolet Silverado 2018', 'chevrolet-silverado-2018', 'Powerful truck for work and adventure with 5.3L V8 engine and towing package.', 22000.00, 3, 4, 2018, 42000, 'Automatic', 'Gasoline', 'White', 'Good', true, true),
('Nissan Altima 2020', 'nissan-altima-2020', 'Comfortable sedan with smooth ride and fuel-efficient 2.5L engine.', 13000.00, 1, 5, 2020, 38000, 'Automatic', 'Gasoline', 'Silver', 'Good', false, true),
('Jeep Wrangler 2017', 'jeep-wrangler-2017', 'Off-road SUV ready for adventure with 4x4 capability and removable doors.', 19500.00, 2, 6, 2017, 45000, 'Manual', 'Gasoline', 'Green', 'Fair', false, true),
('BMW 3 Series 2021', 'bmw-3-series-2021', 'Luxury sedan with premium features, turbocharged engine, and exceptional handling.', 28000.00, 5, 7, 2021, 12000, 'Automatic', 'Gasoline', 'Gray', 'Excellent', true, true),
('Hyundai Tucson 2022', 'hyundai-tucson-2022', 'Compact SUV with modern design, available AWD, and impressive fuel economy.', 21000.00, 2, 8, 2022, 8000, 'Automatic', 'Gasoline', 'Blue', 'Excellent', false, true),
('Chevrolet Malibu 2021', 'chevrolet-malibu-2021', 'Midsize sedan with spacious interior and comfortable ride quality.', 17500.00, 1, 9, 2021, 20000, 'Automatic', 'Gasoline', 'White', 'Good', false, true),
('Tesla Model 3 2022', 'tesla-model-3-2022', 'Electric sedan with autopilot, long range, and instant acceleration.', 45000.00, 6, 10, 2022, 5000, 'Automatic', 'Electric', 'Red', 'Excellent', true, true),
('Ford F-150 2021', 'ford-f-150-2021', 'Best-selling pickup truck with EcoBoost engine and advanced towing technology.', 38000.00, 3, 1, 2021, 10000, 'Automatic', 'Gasoline', 'Black', 'Excellent', true, true),
('Honda CR-V 2020', 'honda-cr-v-2020', 'Reliable SUV with great cargo space and excellent safety ratings.', 22000.00, 2, 2, 2020, 25000, 'Automatic', 'Gasoline', 'Silver', 'Good', false, true);

-- Insert vehicle images
INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, caption) VALUES
(1, '/images/vehicles/toyota-corolla.jpg', true, 'Toyota Corolla 2020 exterior'),
(2, '/images/vehicles/ford-explorer.jpg', true, 'Ford Explorer 2019 front view'),
(3, '/images/vehicles/honda-civic.jpg', true, 'Honda Civic 2021 red'),
(4, '/images/vehicles/chevrolet-silverado.jpg', true, 'Chevrolet Silverado 2018'),
(5, '/images/vehicles/nissan-altima.jpg', true, 'Nissan Altima 2020'),
(6, '/images/vehicles/jeep-wrangler.jpg', true, 'Jeep Wrangler 2017'),
(7, '/images/vehicles/bmw-3-series.jpg', true, 'BMW 3 Series 2021'),
(8, '/images/vehicles/hyundai-tucson.jpg', true, 'Hyundai Tucson 2022'),
(9, '/images/vehicles/chevrolet-malibu.jpg', true, 'Chevrolet Malibu 2021'),
(10, '/images/vehicles/tesla-model-3.jpg', true, 'Tesla Model 3 2022'),
(11, '/images/vehicles/ford-f150.jpg', true, 'Ford F-150 2021'),
(12, '/images/vehicles/honda-crv.jpg', true, 'Honda CR-V 2020');

-- Insert vehicle specs
INSERT INTO vehicle_specs (vehicle_id, feature, value) VALUES
(1, 'Engine', '1.8L 4-cylinder'),
(1, 'Horsepower', '139 HP'),
(1, 'Torque', '126 lb-ft'),
(1, 'MPG City', '30'),
(1, 'MPG Highway', '38'),
(1, 'Drivetrain', 'FWD'),
(1, 'Seats', '5'),
(1, 'Doors', '4'),
(1, 'Warranty', '3 years/36,000 miles'),
(2, 'Engine', '3.5L V6'),
(2, 'Horsepower', '300 HP'),
(2, 'Torque', '280 lb-ft'),
(2, 'MPG City', '18'),
(2, 'MPG Highway', '24'),
(2, 'Drivetrain', 'AWD'),
(2, 'Seats', '7'),
(2, 'Doors', '4'),
(2, 'Towing Capacity', '5,600 lbs'),
(3, 'Engine', '2.0L 4-cylinder'),
(3, 'Horsepower', '158 HP'),
(3, 'Torque', '138 lb-ft'),
(3, 'MPG City', '32'),
(3, 'MPG Highway', '42'),
(3, 'Drivetrain', 'FWD'),
(3, 'Seats', '5'),
(3, 'Doors', '4'),
(4, 'Engine', '5.3L V8'),
(4, 'Horsepower', '355 HP'),
(4, 'Torque', '383 lb-ft'),
(4, 'MPG City', '16'),
(4, 'MPG Highway', '22'),
(4, 'Drivetrain', '4WD'),
(4, 'Seats', '6'),
(4, 'Doors', '4'),
(4, 'Towing Capacity', '13,000 lbs'),
(5, 'Engine', '2.5L 4-cylinder'),
(5, 'Horsepower', '188 HP'),
(5, 'Torque', '180 lb-ft'),
(5, 'MPG City', '28'),
(5, 'MPG Highway', '39'),
(5, 'Drivetrain', 'FWD'),
(5, 'Seats', '5'),
(5, 'Doors', '4'),
(6, 'Engine', '3.6L V6'),
(6, 'Horsepower', '285 HP'),
(6, 'Torque', '260 lb-ft'),
(6, 'MPG City', '18'),
(6, 'MPG Highway', '23'),
(6, 'Drivetrain', '4WD'),
(6, 'Seats', '5'),
(6, 'Doors', '4'),
(6, 'Off-Road', 'Trail Rated'),
(7, 'Engine', '2.0L Turbo 4-cylinder'),
(7, 'Horsepower', '255 HP'),
(7, 'Torque', '295 lb-ft'),
(7, 'MPG City', '25'),
(7, 'MPG Highway', '34'),
(7, 'Drivetrain', 'RWD'),
(7, 'Seats', '5'),
(7, 'Doors', '4'),
(7, '0-60', '5.6 seconds'),
(8, 'Engine', '2.5L 4-cylinder'),
(8, 'Horsepower', '187 HP'),
(8, 'Torque', '178 lb-ft'),
(8, 'MPG City', '26'),
(8, 'MPG Highway', '33'),
(8, 'Drivetrain', 'AWD'),
(8, 'Seats', '5'),
(8, 'Doors', '4'),
(9, 'Engine', '1.5L Turbo 4-cylinder'),
(9, 'Horsepower', '160 HP'),
(9, 'Torque', '184 lb-ft'),
(9, 'MPG City', '29'),
(9, 'MPG Highway', '36'),
(9, 'Drivetrain', 'FWD'),
(9, 'Seats', '5'),
(9, 'Doors', '4'),
(10, 'Battery', '60 kWh Lithium-ion'),
(10, 'Range', '272 miles'),
(10, 'Horsepower', '283 HP'),
(10, 'Torque', '307 lb-ft'),
(10, 'MPGe City', '140'),
(10, 'MPGe Highway', '120'),
(10, 'Seats', '5'),
(10, 'Doors', '4'),
(10, '0-60', '5.3 seconds'),
(10, 'Charging', 'Supercharger capable'),
(11, 'Engine', '3.5L EcoBoost V6'),
(11, 'Horsepower', '400 HP'),
(11, 'Torque', '500 lb-ft'),
(11, 'MPG City', '18'),
(11, 'MPG Highway', '24'),
(11, 'Drivetrain', '4WD'),
(11, 'Seats', '6'),
(11, 'Doors', '4'),
(11, 'Towing Capacity', '14,000 lbs'),
(12, 'Engine', '1.5L Turbo 4-cylinder'),
(12, 'Horsepower', '190 HP'),
(12, 'Torque', '179 lb-ft'),
(12, 'MPG City', '27'),
(12, 'MPG Highway', '32'),
(12, 'Drivetrain', 'AWD'),
(12, 'Seats', '5'),
(12, 'Doors', '4');

-- Insert listings
INSERT INTO listings (vehicle_id, dealer_id, availability, location) VALUES
(1, 1, 'Available', 'New York, NY'),
(2, 2, 'Available', 'Dallas, TX'),
(3, 3, 'Available', 'Miami, FL'),
(4, 4, 'Available', 'Los Angeles, CA'),
(5, 5, 'Available', 'Virginia Beach, VA'),
(6, 6, 'Available', 'Salt Lake City, UT'),
(7, 7, 'Available', 'San Francisco, CA'),
(8, 8, 'Available', 'Chicago, IL'),
(9, 9, 'Available', 'Minneapolis, MN'),
(10, 10, 'Available', 'Phoenix, AZ'),
(11, 1, 'Available', 'New York, NY'),
(12, 2, 'Available', 'Dallas, TX');

-- ============================================
-- ⭐ ACCOUNT TEST - USERS ⭐
-- ============================================

INSERT INTO users (name, email, password, role_id, is_active) VALUES
('Owner User', 'owner@dealer.com', '$2b$12$kgMMZta6hPNKzf3/eMS57Oct0mZFOFQFIrcUnlDPJRD3GF8PpKJsC', 3, true),
('Employee User', 'employee@dealer.com', '$2b$12$7sEgsA4Ec.FyfZ5ipnWRTOBHuTXZWu5O9uySL.75hnYp1FepqsOWS', 2, true),
('Customer User', 'customer@dealer.com', '$2b$12$XGKT3RYknxqr/KWfqvGE6eABgy0JQ4OlcIxbVa/W7J/D/Zm4dhO1i', 1, true)
ON CONFLICT (email) DO NOTHING;

-- Insert service types
INSERT INTO service_types (name, description, estimated_duration, price) VALUES
('Oil Change', 'Standard oil change service including filter replacement', '1 hour', 49.99),
('Tire Rotation', 'Rotate tires for even wear and extended tire life', '45 minutes', 29.99),
('Brake Repair', 'Inspect and repair brake pads, rotors, and calipers', '2 hours', 199.99),
('Engine Diagnostic', 'Comprehensive engine diagnostic to identify issues', '1.5 hours', 89.99),
('Transmission Service', 'Transmission fluid change and system inspection', '3 hours', 299.99),
('Battery Replacement', 'Battery testing and replacement service', '1 hour', 149.99),
('Air Conditioning Service', 'AC system inspection, recharge, and repair', '2 hours', 159.99),
('Suspension Repair', 'Suspension system inspection and repair', '3 hours', 399.99),
('Exhaust System Repair', 'Exhaust system inspection and repair', '2 hours', 249.99),
('Electrical System Repair', 'Electrical system diagnostic and repair', '2.5 hours', 199.99),
('Wheel Alignment', 'Wheel alignment and balancing service', '1.5 hours', 79.99),
('Fluid Check/Change', 'Check and change all vehicle fluids', '1 hour', 99.99),
('Full Inspection', 'Complete vehicle inspection', '3 hours', 149.99);

-- Insert sample service requests
INSERT INTO service_requests (user_id, service_type_id, vehicle_id, description, status, requested_date, estimated_cost) VALUES
(3, 1, 1, 'Need synthetic oil change and filter replacement. Vehicle has been running rough.', 'Submitted', CURRENT_DATE, 69.99),
(3, 3, 2, 'Brakes are making squeaking noise when stopping. Need complete brake inspection.', 'In Progress', CURRENT_DATE - 2, 229.99),
(3, 4, 3, 'Check engine light came on yesterday. Car is idling rough.', 'Completed', CURRENT_DATE - 5, 89.99);

-- Insert sample contact inquiries
INSERT INTO contact_form (customer_name, email, phone, subject, message, status, priority) VALUES
('John Smith', 'john.smith@email.com', '555-123-4567', 'Test Drive Request', 'I would like to schedule a test drive for the Toyota Corolla 2020. Please let me know available times.', 'Received', 'Normal'),
('Jane Doe', 'jane.doe@email.com', '555-987-6543', 'Financing Question', 'Do you offer financing options for the Tesla Model 3? I am interested in purchasing but need payment plan information.', 'In Progress', 'High'),
('Bob Wilson', 'bob.wilson@email.com', '555-456-7890', 'Vehicle Availability', 'Is the Ford Explorer 2019 still available? I saw it online and want to come see it this weekend.', 'Resolved', 'Normal');

COMMIT;