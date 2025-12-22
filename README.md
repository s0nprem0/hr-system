# 🧑‍💼 HR Management System

A simple **full-stack HR management demo** built with a modern React frontend and a secure Express API.
Designed to be **easy to run locally**, easy to read, and easy to extend.

> ⚡ Clean structure, solid security, zero unnecessary setup drama.

---

## 📂 Project Structure

```
root/
├── client/                      # React + Vite frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.*
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── assets/
│       ├── components/           # shared UI (DataTable, Navbar, layout/)
│       ├── pages/                # route views (Employees, Payroll, Users)
│       ├── context/              # AuthContext, ToastContext, etc.
│       ├── utils/                # api.ts, cn.ts, hooks, validators
│       └── tests/                # Vitest tests
|
└── server/                      # Express + TypeScript backend
  ├── package.json
  ├── tsconfig.json
  ├── index.ts                 # entry (starts the server)
  ├── app.ts                   # express app setup and middleware
  ├── controllers/             # auth, employees, departments, payroll
  ├── routes/                  # route registration
  ├── models/                  # Mongoose schemas (User, AuditLog, Department)
  ├── middleware/              # auth, requirePermission, validation handlers
  ├── utils/                   # apiResponse, auditLogger, permissions
  ├── scripts/                 # userSeed.ts
  └── tests/                   # Jest tests
```

> Repo contains `client/` and `server/` only frontend and backend are separated for clarity.

---

## 🛡️ Security Features

This application follows **industry-standard security practices** to protect data and enforce access control:

- **Role-Based Access Control (RBAC)**
  Strict separation between **Admin, HR, Manager, and Employee** roles.
  Backend middleware validates permissions on routes and API endpoints.

- **JWT Authentication**
  Stateless authentication using signed JSON Web Tokens (JWT).
  Tokens are verified on every protected request.

- **Password Encryption**
  Passwords are hashed and salted using **bcrypt**.
  Plain-text passwords are never stored.

- **Data Masking (Frontend)**
  Sensitive fields (e.g. salary, personal identifiers) are masked by default and only revealed via an explicit 👁️ toggle to prevent shoulder-surfing.

- **Audit Logging**
  All salary changes are written to an immutable audit log, tracking:

  - Who made the change
  - When it happened
  - Previous vs. new values

---

## 🛠️ Tech Stack

### Frontend (`client/`)

- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** React Context API (auth state)
- **Routing:** React Router v7
- **Testing:** Vitest

### Backend (`server/`)

- **Runtime:** Bun v1.3.4 (Node-compatible)
- **Framework:** Express.js + TypeScript
- **Database:** MongoDB (Mongoose)
- **Authentication:** jsonwebtoken
- **Security:** bcryptjs
- **Testing:** Jest

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Bun** (recommended) or **Node.js 16+**
- **MongoDB** (local or hosted)

---

### 1️⃣ Environment Setup

Copy the example environment file:

```pwsh
copy server\.env.example server\.env
```

Minimum required values:

```env
JWT_KEY=your_secret_key
MONGO_URI=mongodb://localhost:27017/hr-system
```

---

### 2️⃣ Install Dependencies

```pwsh
cd server
bun install

cd ../client
bun install
```

> Replace `bun install` with `npm install` if using npm.

---

### 3️⃣ Run Development Servers

Open **two terminals**:

```pwsh
# Terminal 1 – Backend
cd server
bun run dev
```

```pwsh
# Terminal 2 – Frontend
cd client
bun run dev
```

Frontend will be available at:

```
http://localhost:5173
```

---

## 🌱 Database Seeding

Populate the database with development users:

```pwsh
cd server
bun run seed
```

⚠️ **Warning**
Resetting the database requires dropping the MongoDB database and re-running the seed script.
This will permanently delete all data.

---

## 🧹 Cleanup

Remove dependencies and caches (PowerShell):

```pwsh
Remove-Item -Recurse -Force server\node_modules
Remove-Item -Recurse -Force client\node_modules
bun cache clear
```

Remove build artifacts:

```pwsh
Remove-Item -Recurse -Force client\dist
Remove-Item -Recurse -Force server\dist
```

---

## 🧪 Tests

Run tests separately for client and server.

```pwsh
cd client
bun run test
```

```pwsh
cd server
bun run test
```

---

## 🐛 Troubleshooting

- Ensure MongoDB is running and `MONGO_URI` is correct
- Check for port conflicts if the server fails to start
- Delete `node_modules` and reinstall if dependencies break
- Use **PowerShell** on Windows, POSIX shell on macOS/Linux

---

## 🤝 Contributing

Issues and PRs are welcome.

Before submitting:

## 🔐 Secure Prototype Guide

This project can be used as a secure-system prototype for a short evaluation or class assignment. The sections below map to the deliverables: a functional prototype, project documentation, and a presentation/demo checklist.

### 1) Introduction

- Purpose: demonstrate a compact HR system implementing core security controls (authentication, authorization, logging) suitable for a live demo.
- Scope: local development only — example users, seed data, and UI flows for employee/payroll management; not a production-ready deployment.
- Objectives: show authentication & authorization, protect sensitive data, and illustrate defenses against common web attacks.

### 2) System Overview

- Components:
  - Frontend: `client/` (React + Vite) — UI, data masking, calls backend APIs.
  - Backend: `server/` (Express + TypeScript) — REST API, auth, business logic, audit logging.
  - Database: MongoDB (Mongoose) for storage of users, departments, payroll, and audit logs.
- Key flows to highlight in the demo: user login, role-based access to protected pages, updating sensitive fields (salary) and viewing the resulting audit log.

### 3) Security Features (implemented)

Below are the main security measures already implemented and how to demonstrate them:

- Authentication & Authorization

  - JWT-based authentication for API requests.
  - Role-Based Access Control (RBAC) enforced via middleware (`server/middleware`), restricting routes to Admin/HR/Manager/Employee as appropriate.
  - Demo: log in as different seeded users (see `server/userSeed.ts`) and show permitted vs. blocked actions.

- Password Security

  - Passwords are hashed with `bcryptjs` before storage; plain text passwords are never stored or returned.
  - Demo: show the `User` model and seed process; explain hashing step.

- Transport & Common-hardening (configured/recommended)

  - Server uses security middleware such as `helmet` and `express-rate-limit` to reduce common attack surface and brute-force attempts.
  - Input validation uses `express-validator` to reduce injection risks.
  - Demo: show middleware registration in `server/app.ts` and a sample validation chain.

- Audit Logging
  - Salary changes and other sensitive updates are written to `AuditLog` entries (immutable audit records) to provide accountability.
  - Demo: perform a salary edit and open the audit log view or query the `auditlogs` collection.

Notes on measures not fully implemented in this prototype (recommended for production): TLS termination (HTTPS), DB encryption-at-rest configuration, and secret rotation policies.

### 4) Technical Details

- Languages & tools: TypeScript, React, Vite, Express, Bun/Node, MongoDB, Mongoose, Jest, Vitest.
- Key packages: `bcryptjs`, `jsonwebtoken`, `helmet`, `express-rate-limit`, `express-validator`, `pino` (logging).
- Test approach: unit tests for controllers and utilities (Jest), component tests (Vitest). Use in-memory MongoDB for fast backend tests (`mongodb-memory-server`).

Development notes:

- Use `bun` (or `npm`) to install and run scripts defined in `client/package.json` and `server/package.json`.
- Seed dev users with `bun run seed` from `server/` to get accounts for the demo.

### Refresh token (httpOnly cookie) flow

This project uses server-stored, single-use refresh tokens delivered as an `HttpOnly` cookie. Key points:

- Server behavior:

  - On successful login the server issues an access JWT (returned in the JSON response) and creates a refresh token record in the database; the refresh token value is set in an `HttpOnly` cookie scoped to `/api/auth`.
  - When the client calls `/api/auth/refresh`, the server reads the cookie, validates and revokes the old refresh token, issues a new access token and a new refresh token cookie (single-use rotation).
  - On logout the server revokes the refresh token and clears the cookie.

- Client adjustments:

  - The client must call authentication endpoints with credentials so cookies are included: axios is configured with `withCredentials: true`.
  - The client stores only the access token (in memory / localStorage) and no longer persists refresh tokens in localStorage.
  - To refresh the access token the client calls `/api/auth/refresh` (no body) and receives a new access token in the JSON response; the refresh cookie is rotated by the server.

- Why this is safer:

  - `HttpOnly` cookies are inaccessible to JavaScript, reducing risk of token theft via XSS.
  - Server-side token rotation and revocation reduce replay risk if a refresh token is leaked.

- Quick manual test (example using `curl`):

  1. Login and save cookies:

```bash
curl -c cookies.txt -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}' http://localhost:3000/api/auth/login
```

2. Refresh using saved cookies:

```bash
curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" -X POST http://localhost:3000/api/auth/refresh
```

3. Logout (clears cookie server-side):

```bash
curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" -X POST http://localhost:3000/api/auth/logout
```

- Production notes:
  - Serve over HTTPS so the cookie `secure` flag is enforced.
  - Choose strict `SameSite` and cookie path settings appropriate for your deployment.
  - Consider binding refresh tokens to client metadata and detecting reuse for additional protection.

### 5) Conclusion & Recommendations

- Summary: this prototype implements authentication, RBAC, password hashing, audit logging, and basic hardening middleware — sufficient to demonstrate secure design choices in a live demo.
- Production recommendations:
  - Enforce HTTPS (TLS) through reverse proxy / hosting platform.
  - Enable MongoDB encryption at rest and network-level access controls.
  - Rotate secrets and adopt short-lived tokens where possible (refresh-token rotation).
  - Harden CSP, CORS, and add additional security headers.
  - Add monitoring/alerting (suspicious logins, rate-limit hits) and centralized secure logging.

### 6) Presentation / Demo Checklist (face-to-face)

- Preparation:

  - Ensure MongoDB is running and `server/.env` has correct values.
  - Run `bun install` in both `server/` and `client/` (or `npm install`).
  - Seed users: `cd server && bun run seed`.

- Live demo steps:

  1. Start backend: `cd server && bun run dev`.
  2. Start frontend: `cd client && bun run dev`.
  3. Open the frontend (`http://localhost:5173`) and log in as an Admin and as a non-Admin user to show role differences.
  4. Edit a salary (or other sensitive field) and show the audit log entry created.
  5. Attempt an unauthorized action (e.g., a non-Admin editing payroll) to show access control.
  6. Show middleware and security package usage in `server/app.ts` and `server/middleware`.

- Q&A tips:
  - Be ready to explain why JWTs were chosen, how RBAC is enforced, and where improvements are needed for production.
  - Discuss trade-offs (stateless tokens vs. server-side sessions, seed data convenience vs. production security).

---
