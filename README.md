# ⚡ NeoMotor | Used Car Dealership

A full-stack, production-ready web application for a used car dealership. Built with modern Node.js (ESM), Express 5, EJS, and PostgreSQL (Neon). Users can browse inventory, leave reviews, manage favorites, track service requests, and compare vehicles side-by-side.

## 🛠️ Technology Stack

| Category                | Technology                                                    |
| ----------------------- | ------------------------------------------------------------- |
| **Runtime & Framework** | Node.js (v20+), Express.js 5                                  |
| **Database**            | PostgreSQL (hosted on [Neon](https://neon.tech)), `pg` (Pool) |
| **Templating**          | EJS (Server-Side Rendering)                                   |
| **Security**            | Helmet, CSRF-Sync, Express-Rate-Limit, Bcrypt                 |
| **Validation**          | Express-Validator                                             |
| **Logging & Env**       | Pino, Zod (Fail-fast environment validation)                  |
| **DevOps & Tooling**    | Render (Deployment), ESLint, Prettier, pnpm                   |

## 🌐 Live Demo

> **URL:** [https://cse340-used-car-dealership-ym5u.onrender.com](https://cse340-used-car-dealership-ym5u.onrender.com)

## ✨ Features

### 🔐 Authentication & Authorization

- Secure registration and login using **Bcrypt** for password hashing.
- **Role-Based Access Control (RBAC)**: Customers, Employees, and Owners.
- Persistent session management with PostgreSQL (`connect-pg-simple`).
- **CSRF Protection** on all state-changing routes (POST/PUT/DELETE).
- **Rate Limiting** to prevent brute-force and spam attacks.

### 🚗 Vehicle Management

- Browse vehicles with search, category filters, and sorting.
- View detailed vehicle specifications and image galleries.
- Dealer inventory display.
- Side-by-side vehicle comparison (up to 3 vehicles).

### 📊 Dashboard Analytics

- **Customer:** Favorites count, reviews submitted, and service requests.
- **Employee:** Open inquiries, pending requests, and total vehicles.
- **Owner:** Global stats (Total users, vehicles, dealers, and reviews).

### 🌙 Modern UI & Accessibility (A11y)

- Dark/Light mode toggle with `localStorage` persistence (no flash of unstyled content).
- Fully responsive, mobile-first design with a **futuristic glassmorphism** aesthetic.
- **Accessible (A11y):** ARIA labels, semantic HTML, keyboard navigation for the mobile menu, and `aria-expanded` states.

## 🏗️ Architecture & Best Practices

This project was refactored from a university assignment into a production-grade application. Key architectural decisions include:

1. **Strict MVC Pattern**: Separation of concerns between Routes, Controllers, Models, and Views.
2. **Fail-Fast Environment**: The server won't start if critical `.env` variables are missing, thanks to `zod`.
3. **Centralized Error Handling**: A global error handler middleware catches both 404s and 500s, rendering safe, user-friendly error pages.
4. **Structured Logging**: Replaced `console.log` with `pino` for production-ready, structured HTTP and server logs.
5. **Database Safety**: The `setup.js` script verifies table existence before attempting to seed, preventing accidental data loss.

## 🗄️ Database Schema

![ERD Diagram](./public/images/ERD_Diagram.png)

_Entity-Relationship Diagram showing the database structure and relationships._

### Core Tables

- `users`, `roles`, `oauth_identities`: User accounts, permissions, and Google/GitHub identity links.
- `vehicles`, `categories`, `dealers`, `listings`: The core inventory system.
- `favorites`, `reviews`, `service_requests`: User interactions.
- `contact_form`, `notifications`: Support and user engagement.

## 👤 User Roles

| Role            | Permissions                                                               |
| --------------- | ------------------------------------------------------------------------- |
| **Owner/Admin** | Full system control - manage users, vehicles, dealers, and all content.   |
| **Employee**    | Edit vehicles, moderate reviews, manage service requests, view inquiries. |
| **Customer**    | Browse vehicles, leave reviews, submit requests, manage favorites.        |

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v20 or higher)
- [pnpm](https://pnpm.io/) (Package Manager)
- PostgreSQL Database (Local or [Neon](https://neon.tech) Cloud)

### Installation Steps

1. **Clone the repository**
    ```bash
    git clone https://github.com/jesustortoleroh/cse340-used-car-dealership.git
    cd cse340-used-car-dealership
    ```

### Google and GitHub Sign-In

Social sign-in is enabled per provider when its client ID and client secret are
configured in the environment. Add these values to `.env` for local development
or to your deployment's environment settings:

```env
OAUTH_CALLBACK_BASE_URL=http://localhost:3000
# Add the client ID and secret for each provider you enable:
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...
```

In Google Cloud Console, create a **Web application** OAuth client and add
`http://localhost:3000/auth/google/callback` as an authorized redirect URI. In
GitHub, create an OAuth App and set its authorization callback URL to
`http://localhost:3000/auth/github/callback`. For production, set
`OAUTH_CALLBACK_BASE_URL` to the public HTTPS origin and register the matching
`/auth/google/callback` and `/auth/github/callback` URLs with each provider.

Keep client secrets out of source control. New social accounts receive the
`customer` role. Existing accounts are linked only when Google or GitHub
provides a verified email matching the account's email address.
