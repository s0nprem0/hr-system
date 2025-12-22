## 🛡️ Security Features

This application implements industry-standard security practices to ensure data integrity and access control:

- **Role-Based Access Control (RBAC):** Strict segregation of duties between Admin, HR, Employee, and Manager roles. Routes and API endpoints are protected using middleware that verifies user permissions before granting access.
- **JWT Authentication:** Stateless authentication using JSON Web Tokens (JWT). Tokens are signed securely on the server and verified on every protected request.
- **Password Encryption:** User passwords are never stored in plain text. We use **Bcrypt** to hash and salt passwords before storage, protecting against rainbow table attacks.
- **Data Masking:** Sensitive information (such as salaries and personal identifiers) is visually masked by default on the frontend, requiring explicit user action ("eye toggle") to view, preventing shoulder-surfing leaks.
- **Audit Logging:** Critical actions, specifically changes to sensitive financial data (Salary), are recorded in an immutable audit log. This tracks _who_ made the change, _when_, and the _previous vs. new values_.

## 🛠️ Technical Stack

**Frontend:**

- **Framework:** React 19 (via Vite) for a fast, responsive user interface.
- **Language:** TypeScript for type safety and maintainable code.
- **Styling:** Tailwind CSS v4 for utility-first, responsive design.
- **State Management:** React Context API for handling Authentication state globally.
- **Routing:** React Router v7 for managing protected routes and navigation.

**Backend:**

- **Runtime:** Bun (v1.3.4) for high-performance JavaScript execution.
- **Framework:** Express.js for RESTful API routing and middleware management.
- **Database:** MongoDB (via Mongoose) for flexible, schema-based data modeling.
- **Authentication:** `jsonwebtoken` for auth flow and `bcryptjs` for security.

## 🚀 Getting Started

Follow these steps to run the project locally (server + client).

Prerequisites:

- Node-compatible runtime (Bun or Node.js) and package manager of your choice.
- MongoDB running locally or a connection string to a hosted database.

1. Copy the example environment file and fill values:

```
cp .env.example .env
# then edit `.env` and set JWT_KEY and MONGO_URI at minimum
```

2. Install dependencies and run both parts:

PowerShell (recommended for Windows users):

````pwsh
# Server
cd server
bun install # or `npm install`
## HR System — README

This repository contains a sample HR management system with a React + Vite frontend in `client/` and an Express-based API in `server/`. The project demonstrates role-based access, JWT auth, audit logging, and standard developer tooling.

---

## Quick Start (Windows)

Prerequisites:
- Install Bun (recommended) or Node.js (16+).
- MongoDB running locally or accessible via `MONGO_URI`.

1) Copy environment files and set secrets:

```pwsh
copy .env.example .env
# Edit `.env` and set at minimum: JWT_KEY, MONGO_URI
````

2. Install dependencies:

```pwsh
# Server
cd server
bun install # or npm install

# Client
cd ../client
bun install # or npm install
```

3. Run dev servers (two terminals):

```pwsh
# Terminal 1: server
cd server
bun run dev # or npm run dev

# Terminal 2: client
cd client
bun run dev # or npm run dev
```

The client defaults to `http://localhost:5173` and the server to `http://localhost:3000` (see server config).

---

## Installation Notes (alternative / Unix)

Use the same steps above but replace `pwsh` commands with POSIX equivalents:

```bash
cp .env.example .env
cd server && bun install
cd ../client && bun install
```

If you prefer `npm`/`pnpm`/`yarn`, replace `bun install` with your package manager of choice.

---

## Cleanup & Reset

- Remove dependencies and caches (Windows PowerShell):

```pwsh
# From project root
Remove-Item -Recurse -Force server\node_modules, client\node_modules
bun cache clear
```

- Reinstall:

```pwsh
cd server; bun install
cd ../client; bun install
```

- Reset database (drop and reseed) — use with caution:

```pwsh
cd server
# Depending on your scripts, this may drop and recreate dev data
bun run seed # or npm run seed
```

- Remove build artifacts:

```pwsh
Remove-Item -Recurse -Force client\dist, server\dist
```

---

## Testing, Linting & Formatting

- Client tests (Vitest) and setup live in `client/tests`:

```pwsh
cd client
bun run test # or npm run test
```

- Server tests (Jest) live in `server/tests`:

```pwsh
cd server
bun run test # or npm run test
```

- Lint / format (if configured):

```pwsh
# Client
cd client
bun run lint
bun run format

# Server
cd server
bun run lint
bun run format
```

---

## Environment Variables

See `.env.example` for the full list. Key variables:

- `JWT_KEY` — signing secret for JWTs (required)
- `MONGO_URI` — MongoDB connection string (defaults to `mongodb://127.0.0.1:27017/hr-system`)
- `CLIENT_URL` — frontend origin for CORS (defaults to `http://localhost:5173`)

Seed account env vars (optional): `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `HR_EMAIL`, `HR_PASSWORD`, `EMP_EMAIL`, `EMP_PASSWORD`.

---

## Seeding Development Users

```pwsh
cd server
bun run seed # or npm run seed
```

This populates example admin/hr/employee accounts. Modify env vars to change credentials.

---

## Troubleshooting

- If you see connection errors, confirm `MONGO_URI` and that MongoDB is running.
- On Windows, prefer PowerShell for the provided commands. If using WSL, adapt commands accordingly.
- If ports conflict, update `CLIENT_URL` or server port in environment/config.
- If using Node instead of Bun, ensure package scripts and dev tooling are compatible (some commands may require small adjustments).

Common fixes:

- Delete `node_modules` and reinstall.
- Clear Bun cache: `bun cache clear`.
- Ensure `.env` is present and not ignored by mistake.

---

## Technical Notes

- Frontend: React + Vite, TypeScript, Tailwind CSS. Source in `client/src`.
- Backend: Express + TypeScript. Source in `server/` with routes in `server/routes` and controllers in `server/controllers`.
- Auth: JWT-based with refresh token handling and permission middleware in `server/middleware`.
- Audit logging: Critical changes are stored in `server/models/AuditLog.ts`.

---
