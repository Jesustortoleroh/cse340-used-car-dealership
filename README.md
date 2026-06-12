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
