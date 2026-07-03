-- ============================================
-- SEED FILE FOR USED CAR DEALERSHIP
-- ============================================
-- This file creates tables and inserts all initial data

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
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS contact_form CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price > 0),
    category_id INTEGER NOT NULL,
    slug VARCHAR(200) UNIQUE,
    year INTEGER,
    mileage INTEGER,
    transmission VARCHAR(50),
    fuel_type VARCHAR(50),
    color VARCHAR(50),
    featured BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Dealers table
CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    slug VARCHAR(200) UNIQUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    dealer_id INTEGER NOT NULL,
    availability VARCHAR(50),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- Vehicle specs table
CREATE TABLE vehicle_specs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    feature VARCHAR(50),
    value VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Vehicle images table
CREATE TABLE vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Contact form table
CREATE TABLE contact_form (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Received',
    submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    rating INTEGER NOT NULL
        CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id)
        ON DELETE CASCADE,

    UNIQUE(user_id, vehicle_id)
);

-- Service types table
CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service requests table
CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    service_type_id INTEGER NOT NULL,
    vehicle_id INTEGER,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted',
    notes TEXT,
    requested_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- Session table
CREATE TABLE session (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- ============================================
-- 3. INSERT DATA
-- ============================================

-- Insert categories
INSERT INTO categories (name) VALUES
('Car'), ('SUV'), ('Truck'), ('Van'), ('Luxury'), ('Electric'), ('Hybrid');

-- Insert vehicles
INSERT INTO vehicles (name, description, price, category_id, slug, year, mileage, transmission, fuel_type, color, featured) VALUES
('Toyota Corolla 2020', 'Reliable compact car with excellent fuel economy', 12000, 1, 'toyota-corolla-2020', 2020, 35000, 'Automatic', 'Gasoline', 'Red', true),
('Ford Explorer 2019', 'Spacious SUV perfect for families', 18500, 2, 'ford-explorer-2019', 2019, 28000, 'Automatic', 'Gasoline', 'Black', true),
('Honda Civic 2021', 'Modern sedan with great handling', 14300, 1, 'honda-civic-2021', 2021, 15000, 'Manual', 'Gasoline', 'Blue', false),
('Chevrolet Silverado 2018', 'Powerful truck for work and adventure', 22000, 3, 'chevrolet-silverado-2018', 2018, 42000, 'Automatic', 'Gasoline', 'White', true),
('Nissan Altima 2020', 'Comfortable sedan with smooth ride', 13000, 1, 'nissan-altima-2020', 2020, 38000, 'Automatic', 'Gasoline', 'Silver', false),
('Jeep Wrangler 2017', 'Off-road SUV ready for adventure', 19500, 2, 'jeep-wrangler-2017', 2017, 45000, 'Manual', 'Gasoline', 'Green', false),
('BMW 3 Series 2021', 'Luxury sedan with premium features', 28000, 5, 'bmw-3-series-2021', 2021, 12000, 'Automatic', 'Gasoline', 'Gray', true),
('Hyundai Tucson 2022', 'Compact SUV with modern design', 21000, 2, 'hyundai-tucson-2022', 2022, 8000, 'Automatic', 'Gasoline', 'Blue', false),
('Chevrolet Malibu 2021', 'Midsize sedan with spacious interior', 17500, 1, 'chevrolet-malibu-2021', 2021, 20000, 'Automatic', 'Gasoline', 'White', false),
('Tesla Model 3 2022', 'Electric sedan with autopilot', 45000, 6, 'tesla-model-3-2022', 2022, 5000, 'Automatic', 'Electric', 'Red', true),
('Ford F-150 2021', 'Best-selling pickup truck', 38000, 3, 'ford-f-150-2021', 2021, 10000, 'Automatic', 'Gasoline', 'Black', true),
('Honda CR-V 2020', 'Reliable SUV with great cargo space', 22000, 2, 'honda-cr-v-2020', 2020, 25000, 'Automatic', 'Gasoline', 'Silver', false);

-- Insert dealers with images
INSERT INTO dealers (
    name,
    location,
    phone,
    email,
    slug,
    image_url
) VALUES

(
    'AutoWorld Motors',
    'New York',
    '123-456-7890',
    'info@autoworld.com',
    'autoworld-motors',
    '/images/dealers/autoworld.jpg'
),

(
    'City Auto Sales',
    'Texas',
    '555-666-7777',
    'contact@cityauto.com',
    'city-auto-sales',
    '/images/dealers/city-auto.jpg'
),

(
    'Elite Motors',
    'Florida',
    '888-999-0000',
    'elite@motors.com',
    'elite-motors',
    '/images/dealers/elite-motors.jpg'
),

(
    'Prime Cars',
    'California',
    '222-333-4444',
    'sales@primecars.com',
    'prime-cars',
    '/images/dealers/prime-cars.jpg'
),

(
    'Atlantic Auto Center',
    'Virginia',
    '666-777-8888',
    'sales@atlanticauto.com',
    'atlantic-auto-center',
    '/images/dealers/atlantic-auto.jpg'
),

(
    'Blue Sky Automotive',
    'Utah',
    '801-555-2002',
    'sales@blueskyauto.com',
    'blue-sky-automotive',
    '/images/dealers/blue-sky.jpg'
),

(
    'Golden State Cars',
    'California',
    '123-987-4560',
    'sales@goldenstatecars.com',
    'golden-state-cars',
    '/images/dealers/golden-state.jpg'
),

(
    'Metro Auto Mall',
    'Illinois',
    '312-555-6006',
    'contact@metroautomall.com',
    'metro-auto-mall',
    '/images/dealers/metro-auto.jpg'
),

(
    'Northstar Motors',
    'Minnesota',
    '999-000-1111',
    'info@northstarmotors.com',
    'northstar-motors',
    '/images/dealers/northstar.jpg'
),

(
    'Sunshine Auto Group',
    'Arizona',
    '111-222-3333',
    'contact@sunshineauto.com',
    'sunshine-auto-group',
    '/images/dealers/sunshine.jpg'
);

-- Insert listings
INSERT INTO listings (vehicle_id, dealer_id, availability, location) VALUES
(1, 1, 'Available', 'New York'),
(2, 2, 'Available', 'Texas'),
(3, 3, 'Available', 'Florida'),
(4, 4, 'Available', 'California'),
(5, 5, 'Available', 'Virginia'),
(6, 6, 'Available', 'Utah'),
(7, 7, 'Available', 'California'),
(8, 8, 'Available', 'Illinois'),
(9, 9, 'Available', 'Minnesota'),
(10, 10, 'Available', 'Arizona'),
(11, 1, 'Available', 'New York'),
(12, 2, 'Available', 'Texas');

-- Insert vehicle specs
INSERT INTO vehicle_specs (vehicle_id, feature, value) VALUES

-- Toyota Corolla
(1, 'Mileage', '35 MPG'),
(1, 'Transmission', 'Automatic'),
(1, 'Color', 'Red'),
(1, 'Engine', '1.8L'),
(1, 'Horsepower', '139 HP'),
(1, 'Doors', '4'),
(1, 'Seats', '5'),
(1, 'Drivetrain', 'FWD'),

-- Ford Explorer
(2, 'Mileage', '25 MPG'),
(2, 'Transmission', 'Automatic'),
(2, 'Color', 'Black'),
(2, 'Engine', '3.5L V6'),
(2, 'Horsepower', '300 HP'),
(2, 'Doors', '4'),
(2, 'Seats', '7'),
(2, 'Drivetrain', 'AWD'),

-- Honda Civic
(3, 'Mileage', '32 MPG'),
(3, 'Transmission', 'Manual'),
(3, 'Color', 'Blue'),
(3, 'Engine', '2.0L'),
(3, 'Horsepower', '158 HP'),
(3, 'Doors', '4'),
(3, 'Seats', '5'),
(3, 'Drivetrain', 'FWD'),

-- Chevrolet Silverado
(4, 'Mileage', '20 MPG'),
(4, 'Transmission', 'Automatic'),
(4, 'Color', 'White'),
(4, 'Engine', '5.3L V8'),
(4, 'Horsepower', '355 HP'),
(4, 'Doors', '4'),
(4, 'Seats', '6'),
(4, 'Towing Capacity', '13000 lbs'),

-- Nissan Altima
(5, 'Mileage', '34 MPG'),
(5, 'Transmission', 'Automatic'),
(5, 'Color', 'Silver'),
(5, 'Engine', '2.5L'),
(5, 'Horsepower', '188 HP'),
(5, 'Doors', '4'),
(5, 'Seats', '5'),
(5, 'Drivetrain', 'FWD'),

-- Jeep Wrangler
(6, 'Mileage', '18 MPG'),
(6, 'Transmission', 'Manual'),
(6, 'Color', 'Green'),
(6, 'Engine', '3.6L V6'),
(6, 'Horsepower', '285 HP'),
(6, 'Doors', '4'),
(6, 'Seats', '5'),
(6, 'Drivetrain', '4WD'),

-- BMW 3 Series
(7, 'Mileage', '30 MPG'),
(7, 'Transmission', 'Automatic'),
(7, 'Color', 'Gray'),
(7, 'Engine', '2.0L Turbo'),
(7, 'Horsepower', '255 HP'),
(7, 'Doors', '4'),
(7, 'Seats', '5'),
(7, 'Drivetrain', 'RWD'),

-- Hyundai Tucson
(8, 'Mileage', '28 MPG'),
(8, 'Transmission', 'Automatic'),
(8, 'Color', 'Blue'),
(8, 'Engine', '2.5L'),
(8, 'Horsepower', '187 HP'),
(8, 'Doors', '4'),
(8, 'Seats', '5'),
(8, 'Drivetrain', 'AWD'),

-- Chevrolet Malibu
(9, 'Mileage', '29 MPG'),
(9, 'Transmission', 'Automatic'),
(9, 'Color', 'White'),
(9, 'Engine', '1.5L Turbo'),
(9, 'Horsepower', '160 HP'),
(9, 'Doors', '4'),
(9, 'Seats', '5'),
(9, 'Drivetrain', 'FWD'),

-- Tesla Model 3
(10, 'Mileage', '140 MPGe'),
(10, 'Transmission', 'Automatic'),
(10, 'Color', 'Red'),
(10, 'Battery', '60 kWh'),
(10, 'Range', '272 Miles'),
(10, 'Horsepower', '283 HP'),
(10, 'Seats', '5'),
(10, 'Charging', 'Supercharger'),

-- Ford F-150
(11, 'Mileage', '22 MPG'),
(11, 'Transmission', 'Automatic'),
(11, 'Color', 'Black'),
(11, 'Engine', '3.5L EcoBoost'),
(11, 'Horsepower', '400 HP'),
(11, 'Doors', '4'),
(11, 'Seats', '6'),
(11, 'Towing Capacity', '14000 lbs'),

-- Honda CR-V
(12, 'Mileage', '26 MPG'),
(12, 'Transmission', 'Automatic'),
(12, 'Color', 'Silver'),
(12, 'Engine', '1.5L Turbo'),
(12, 'Horsepower', '190 HP'),
(12, 'Doors', '4'),
(12, 'Seats', '5'),
(12, 'Drivetrain', 'AWD');


INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES
(1, '/images/vehicles/toyota-corolla.jpg', true),
(2, '/images/vehicles/ford-explorer.jpg', true),
(3, '/images/vehicles/honda-civic.jpg', true),
(4, '/images/vehicles/chevrolet-silverado.jpg', true),
(5, '/images/vehicles/nissan-altima.jpg', true),
(6, '/images/vehicles/jeep-wrangler.jpg', true),
(7, '/images/vehicles/bmw-3-series.jpg', true),
(8, '/images/vehicles/hyundai-tucson.jpg', true),
(9, '/images/vehicles/chevrolet-malibu.jpg', true),
(10, '/images/vehicles/tesla-model-3.jpg', true),
(11, '/images/vehicles/ford-f150.jpg', true),
(12, '/images/vehicles/honda-crv.jpg', true);

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
);


INSERT INTO users (name, email, password, role_id )
VALUES
('Owner User', 
'owner@dealer.com',
'$2b$10$kgMMZta6hPNKzf3/eMS57Oct0mZFOFQFIrcUnlDPJRD3GF8PpKJsC',
    3
),
(
    'Employee User',
    'employee@dealer.com',
    '$2b$10$7sEgsA4Ec.FyfZ5ipnWRTOBHuTXZWu5O9uySL.75hnYp1FepqsOWS',
    2
),
(
    'Customer User',
    'customer@dealer.com',
    '$2b$10$XGKT3RYknxqr/KWfqvGE6eABgy0JQ4OlcIxbVa/W7J/D/Zm4dhO1i',
    1
);

-- Insert service types
INSERT INTO service_types (name, description) VALUES
('Oil Change', 'Standard oil change service including filter replacement'),
('Tire Rotation', 'Rotate tires for even wear and extended tire life'),
('Brake Repair', 'Inspect and repair brake pads, rotors, and calipers'),
('Engine Diagnostic', 'Comprehensive engine diagnostic to identify issues'),
('Transmission Service', 'Transmission fluid change and system inspection'),
('Battery Replacement', 'Battery testing and replacement service'),
('Air Conditioning Service', 'AC system inspection, recharge, and repair'),
('Suspension Repair', 'Suspension system inspection and repair'),
('Exhaust System Repair', 'Exhaust system inspection and repair'),
('Electrical System Repair', 'Electrical system diagnostic and repair'),
('Wheel Alignment', 'Wheel alignment and balancing service'),
('Fluid Check/Change', 'Check and change all vehicle fluids'),
('Other', 'Other service not listed');

-- Insert sample service requests
INSERT INTO service_requests (user_id, service_type_id, vehicle_id, description, status, notes) VALUES
(3, 1, 1, 'Need oil change and filter replacement', 'Submitted', 'Customer requested synthetic oil'),
(3, 3, 2, 'Brakes making noise, need inspection', 'In Progress', 'Front brake pads worn out'),
(3, 4, 3, 'Check engine light is on', 'Submitted', 'Customer reports rough idle');

COMMIT;