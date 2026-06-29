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
('Elite Motors', 'Florida', '888-999-0000', 'elite@motors.com', 'elite-motors'),
('Sunshine Auto Group', 'Arizona', '111-222-3333', 'contact@sunshineauto.com', 'sunshine-auto-group'),
('Mountain View Motors', 'Colorado', '444-555-6666', 'sales@mountainviewmotors.com', 'mountain-view-motors'),
('Lakeside Vehicles', 'Michigan', '777-888-9999', 'info@lakesidevehicles.com', 'lakeside-vehicles'),
('Desert Drive Auto', 'Nevada', '333-444-5555', 'contact@desertdriveauto.com', 'desert-drive-auto'),
('Atlantic Auto Center', 'Virginia', '666-777-8888', 'sales@atlanticauto.com', 'atlantic-auto-center'),
('Northstar Motors', 'Minnesota', '999-000-1111', 'info@northstarmotors.com', 'northstar-motors'),
('Golden State Cars', 'California', '123-987-4560', 'sales@goldenstatecars.com', 'golden-state-cars'),
('Capital City Motors', 'Washington DC', '202-555-1001', 'info@capitalcitymotors.com', 'capital-city-motors'),
('Blue Sky Automotive', 'Utah', '801-555-2002', 'sales@blueskyauto.com', 'blue-sky-automotive'),
('Southern Wheels', 'Georgia', '404-555-3003', 'contact@southernwheels.com', 'southern-wheels'),
('Great Plains Auto', 'Kansas', '785-555-4004', 'info@greatplainsauto.com', 'great-plains-auto'),
('Pacific Coast Cars', 'Oregon', '503-555-5005', 'sales@pacificcoastcars.com', 'pacific-coast-cars'),
('Metro Auto Mall', 'Illinois', '312-555-6006', 'contact@metroautomall.com', 'metro-auto-mall'),
('Riverfront Motors', 'Missouri', '314-555-7007', 'sales@riverfrontmotors.com', 'riverfront-motors'),
('Crown Auto Dealers', 'North Carolina', '919-555-8008', 'info@crownauto.com', 'crown-auto-dealers'),
('Prestige Vehicle Center', 'Washington', '206-555-9009', 'sales@prestigevehicles.com', 'prestige-vehicle-center');

-- Insert listings
INSERT INTO listings (vehicle_id, dealer_id, availability, location) VALUES
(1, 1, 'Available', 'New York'),
(1, 5, 'Available', 'Arizona'),

(2, 2, 'Available', 'California'),
(2, 6, 'Available', 'Colorado'),

(3, 3, 'Available', 'Texas'),
(3, 7, 'Available', 'Michigan'),

(4, 4, 'Sold', 'Florida'),
(4, 8, 'Available', 'Nevada'),

(5, 9, 'Available', 'Virginia'),
(5, 17, 'Available', 'Illinois'),

(6, 10, 'Available', 'Minnesota'),
(6, 18, 'Available', 'Missouri'),

(7, 11, 'Available', 'California'),
(7, 19, 'Available', 'North Carolina'),

(8, 12, 'Available', 'Washington DC'),
(8, 20, 'Available', 'Washington'),

(9, 13, 'Available', 'Utah'),
(10, 14, 'Available', 'Georgia'),
(11, 15, 'Available', 'Kansas'),
(12, 16, 'Available', 'Oregon');

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

COMMIT;