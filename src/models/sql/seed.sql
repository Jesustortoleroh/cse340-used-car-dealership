BEGIN;

-- ============================================
-- 1. ELIMINAR TABLAS EXISTENTES
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
-- 2. CREAR TABLAS
-- ============================================

-- CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- VEHICLES
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

-- VEHICLE IMAGES
CREATE TABLE vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Dealers table
CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    slug VARCHAR(200) UNIQUE,  -- <-- AGREGAR ESTA LÍNEA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LISTINGS
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    dealer_id INTEGER NOT NULL,
    availability VARCHAR(50),
    location VARCHAR(100),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- VEHICLE SPECS
CREATE TABLE vehicle_specs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    feature VARCHAR(50),
    value VARCHAR(100),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- ROLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- REVIEWS
CREATE TABLE reviews (
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

-- SERVICE REQUESTS
CREATE TABLE service_requests (
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

-- CONTACT FORM
CREATE TABLE contact_form (
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
-- 3. INSERTAR DATOS
-- ============================================

-- INSERT CATEGORIES
INSERT INTO categories (name) VALUES
('Car'), ('SUV'), ('Truck'), ('Van'), ('Luxury'), ('Electric'), ('Hybrid');

-- INSERT ROLES
INSERT INTO roles (role_name, role_description) VALUES
('customer', 'Standard dealership customer account'),
('employee', 'Dealership employee account'),
('owner', 'Full dealership administration access')
ON CONFLICT (role_name) DO NOTHING;

-- INSERT USERS (password: P@@$wOrd! - hashed with bcrypt)
INSERT INTO users (name, email, password, role_id) VALUES
('John Customer', 'customer@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
('Jane Employee', 'employee@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2),
('Admin Owner', 'owner@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3)
ON CONFLICT (email) DO NOTHING;

-- INSERT VEHICLES
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

-- INSERT VEHICLE IMAGES
INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES
(1, '/images/vehicles/toyota-corolla-2020.jpg', true),
(2, '/images/vehicles/ford-explorer-2019.jpg', true),
(3, '/images/vehicles/honda-civic-2021.jpg', true),
(4, '/images/vehicles/chevrolet-silverado-2018.jpg', true),
(5, '/images/vehicles/nissan-altima-2020.jpg', true),
(6, '/images/vehicles/jeep-wrangler-2017.jpg', true),
(7, '/images/vehicles/bmw-3-series-2021.jpg', true),
(8, '/images/vehicles/hyundai-tucson-2022.jpg', true),
(9, '/images/vehicles/chevrolet-malibu-2021.jpg', true),
(10, '/images/vehicles/tesla-model-3-2022.jpg', true),
(11, '/images/vehicles/ford-f-150-2021.jpg', true),
(12, '/images/vehicles/honda-cr-v-2020.jpg', true);

-- Insert dealers
INSERT INTO dealers (name, location, phone, email, slug) VALUES
('AutoWorld Motors', 'New York', '123-456-7890', 'info@autoworld.com', 'autoworld-motors'),
('Prime Cars', 'California', '222-333-4444', 'sales@primecars.com', 'prime-cars'),
('City Auto Sales', 'Texas', '555-666-7777', 'contact@cityauto.com', 'city-auto-sales'),
('Elite Motors', 'Florida', '888-999-0000', 'elite@motors.com', 'elite-motors');

-- INSERT LISTINGS
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

-- INSERT VEHICLE SPECS
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

-- INSERT REVIEWS
INSERT INTO reviews (user_id, vehicle_id, rating, comment) VALUES
(1, 1, 5, 'Excellent car! Very reliable and great on gas.'),
(1, 2, 4, 'Good SUV, comfortable for long trips.'),
(2, 3, 5, 'Love this car! Great handling and stylish.'),
(2, 4, 3, 'Good truck but could be more fuel efficient.'),
(3, 7, 5, 'Amazing luxury car! Worth every penny.'),
(1, 10, 5, 'Tesla is incredible! The autopilot is a game changer.');

-- INSERT SERVICE REQUESTS
INSERT INTO service_requests (user_id, vehicle_id, service_type, description, status, requested_date) VALUES
(1, 1, 'Oil Change', 'Regular oil change and filter replacement', 'completed', '2024-01-15'),
(1, 2, 'Tire Rotation', 'Rotate tires and check alignment', 'in_progress', '2024-02-01'),
(2, 3, 'Brake Service', 'Replace brake pads and rotors', 'submitted', '2024-02-15'),
(2, 4, 'Engine Check', 'Check engine light is on', 'submitted', '2024-02-20'),
(3, 7, 'Detail Service', 'Full interior and exterior detail', 'completed', '2024-01-10'),
(1, 10, 'Software Update', 'Install latest Tesla software update', 'in_progress', '2024-02-10');

-- INSERT CONTACT MESSAGES
INSERT INTO contact_form (customer_name, email, phone, subject, message, status) VALUES
('John Doe', 'john@email.com', '555-1111', 'Test Drive Inquiry', 'I would like to schedule a test drive for the Toyota Corolla.', 'new'),
('Jane Smith', 'jane@email.com', '555-2222', 'Financing Question', 'Do you offer financing options for used vehicles?', 'read'),
('Bob Johnson', 'bob@email.com', '555-3333', 'Trade-In Question', 'I would like to trade in my 2018 Honda Civic. What is the process?', 'replied');

COMMIT;