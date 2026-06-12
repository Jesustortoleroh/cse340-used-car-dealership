BEGIN;

-- DROP TABLES
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS vehicle_specs CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

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
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- DEALERS
CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150) UNIQUE
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

-- INSERT CATEGORIES
INSERT INTO categories (name) VALUES
('Car'), ('SUV'), ('Truck'), ('Van'), ('Luxury'), ('Electric'), ('Hybrid');

-- INSERT VEHICLES 
INSERT INTO vehicles (name, description, price, category_id, slug) VALUES
('Toyota Corolla 2020', 'Reliable compact car', 12000, 1, 'toyota-corolla-2020'),
('Ford Explorer 2019', 'Spacious SUV', 18500, 2, 'ford-explorer-2019'),
('Honda Civic 2021', 'Modern sedan', 14300, 1, 'honda-civic-2021'),
('Chevrolet Silverado 2018', 'Powerful truck', 22000, 3, 'chevrolet-silverado-2018'),
('Nissan Altima 2020', 'Comfortable sedan', 13000, 1, 'nissan-altima-2020'),
('Jeep Wrangler 2017', 'Off-road SUV', 19500, 2, 'jeep-wrangler-2017'),
('BMW 3 Series 2021', 'Luxury sedan', 28000, 5, 'bmw-3-series-2021'),
('Hyundai Tucson 2022', 'Compact SUV', 21000, 2, 'hyundai-tucson-2022'),
('Chevrolet Malibu 2021', 'Midsize sedan', 17500, 1, 'chevrolet-malibu-2021');

-- DEALERS
INSERT INTO dealers (name, location, phone, email) VALUES
('AutoWorld Motors', 'New York', '123-456-7890', 'info@autoworld.com'),
('Prime Cars', 'California', '222-333-4444', 'sales@primecars.com'),
('City Auto Sales', 'Texas', '555-666-7777', 'contact@cityauto.com'),
('Elite Motors', 'Florida', '888-999-0000', 'elite@motors.com');

-- LISTINGS
INSERT INTO listings (vehicle_id, dealer_id, availability, location) VALUES
(1, 1, 'Available', 'New York'),
(2, 2, 'Available', 'California'),
(3, 3, 'Available', 'Texas'),
(4, 4, 'Sold', 'Florida');

-- VEHICLE SPECS 
INSERT INTO vehicle_specs (vehicle_id, feature, value) VALUES
(1, 'Mileage', '35 MPG'), (1, 'Transmission', 'Automatic'), (1, 'Color', 'Red'),
(2, 'Mileage', '25 MPG'), (2, 'Transmission', 'Automatic'), (2, 'Color', 'Black'),
(3, 'Mileage', '32 MPG'), (3, 'Transmission', 'Manual'), (3, 'Color', 'Blue'),
(4, 'Mileage', '20 MPG'), (4, 'Transmission', 'Automatic'), (4, 'Color', 'White'),
(5, 'Mileage', '34 MPG'), (5, 'Transmission', 'Automatic'), (5, 'Color', 'Silver'),
(6, 'Mileage', '18 MPG'), (6, 'Transmission', 'Manual'), (6, 'Color', 'Green'),
(7, 'Mileage', '30 MPG'), (7, 'Transmission', 'Automatic'), (7, 'Color', 'Gray'),
(8, 'Mileage', '28 MPG'), (8, 'Transmission', 'Automatic'), (8, 'Color', 'Blue'),
(9, 'Mileage', '29 MPG'), (9, 'Transmission', 'Automatic'), (9, 'Color', 'White');

COMMIT;