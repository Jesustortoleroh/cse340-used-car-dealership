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

-- Insert dealers with slugs
INSERT INTO dealers (name, location, phone, email, slug) VALUES
('AutoWorld Motors', 'New York', '123-456-7890', 'info@autoworld.com', 'autoworld-motors'),
('Prime Cars', 'California', '222-333-4444', 'sales@primecars.com', 'prime-cars'),
('City Auto Sales', 'Texas', '555-666-7777', 'contact@cityauto.com', 'city-auto-sales'),
('Elite Motors', 'Florida', '888-999-0000', 'elite@motors.com', 'elite-motors');

-- Insert listings
INSERT INTO listings (vehicle_id, dealer_id, availability, location) VALUES
(1, 1, 'Available', 'New York'),
(2, 2, 'Available', 'California'),
(3, 3, 'Available', 'Texas'),
(4, 4, 'Sold', 'Florida'),
(5, 1, 'Available', 'New York'),
(6, 2, 'Available', 'California'),
(7, 3, 'Sold', 'Texas'),
(8, 4, 'Available', 'Florida'),
(9, 1, 'Available', 'New York'),
(10, 2, 'Available', 'California'),
(11, 3, 'Available', 'Texas'),
(12, 4, 'Available', 'Florida');

-- Insert vehicle specs
INSERT INTO vehicle_specs (vehicle_id, feature, value) VALUES
(1, 'Mileage', '35 MPG'), (1, 'Transmission', 'Automatic'), (1, 'Color', 'Red'),
(2, 'Mileage', '25 MPG'), (2, 'Transmission', 'Automatic'), (2, 'Color', 'Black'),
(3, 'Mileage', '32 MPG'), (3, 'Transmission', 'Manual'), (3, 'Color', 'Blue'),
(4, 'Mileage', '20 MPG'), (4, 'Transmission', 'Automatic'), (4, 'Color', 'White'),
(5, 'Mileage', '34 MPG'), (5, 'Transmission', 'Automatic'), (5, 'Color', 'Silver'),
(6, 'Mileage', '18 MPG'), (6, 'Transmission', 'Manual'), (6, 'Color', 'Green'),
(7, 'Mileage', '30 MPG'), (7, 'Transmission', 'Automatic'), (7, 'Color', 'Gray'),
(8, 'Mileage', '28 MPG'), (8, 'Transmission', 'Automatic'), (8, 'Color', 'Blue'),
(9, 'Mileage', '29 MPG'), (9, 'Transmission', 'Automatic'), (9, 'Color', 'White'),
(10, 'Mileage', '140 MPGe'), (10, 'Transmission', 'Automatic'), (10, 'Color', 'Red'),
(11, 'Mileage', '22 MPG'), (11, 'Transmission', 'Automatic'), (11, 'Color', 'Black'),
(12, 'Mileage', '26 MPG'), (12, 'Transmission', 'Automatic'), (12, 'Color', 'Silver');

COMMIT;