# cse340-used-car-dealership

Used car dealership web application built with Node.js, Express, and EJS.

## Technology Stack

- Node.js with Express.js as the backend framework
- EJS for rendering views
- ESM (ECMAScript Modules), no CommonJS (require is not allowed)
- PostgreSQL for the database
- Deployed on Render with a connected PostgreSQL database

## Project Description

A server-side rendered used car dealership web app where users browse inventory, leave reviews, and track service requests. Employees manage listings and requests; owners control all inventory and categories. Built with Node.js, Express, EJS, and PostgreSQL.

## Database Schema

./public/images/ERD.png

## User Roles

- **Owner/Admin**: Full control - add/edit/delete vehicles and categories, manage employee accounts, view all data
- **Employee**: Edit vehicle details, moderate reviews, manage service requests
- **Standard User**: Leave/edit/delete reviews, submit service requests, view history


## Database Tables (Planned)

- Users (role: owner, employee, user)
- Categories (Trucks, Vans, Cars, SUVs)
- Vehicles
- Reviews
- Service Requests (status: Submitted, In Progress, Completed)
- Contact Messages
- Vehicle Images

## Test Accounts

### Owner
Email: owner@dealer.com

### Employee
Email: employee@dealer.com

### Customer
Email: customer@dealer.com

All test accounts use the password:

P@$$w0rd!

## Known Limitations

- Vehicle filtering is currently limited to categories. Advanced filtering by price, mileage, year, and fuel type is not implemented.
- Vehicle detail pages display only the primary image even though multiple images can be stored in the database.
- Vehicle keyword search functionality is not currently available.
- Service request updates do not generate automatic user notifications.
- No major functional defects are currently known.