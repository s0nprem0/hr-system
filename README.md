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

```pwsh
# Server
cd server
bun install # or `npm install`

# Client
cd ../client
bun install # or `npm install`
```

3. Start the server and client in development:

```pwsh
# From `server/`
bun run dev # or `npm run dev`

# From `client/`
bun run dev # or `npm run dev`
```

## 🔧 Environment Variables

The project uses environment variables for configuration. See `.env.example` for the full list. Important variables:

- `JWT_KEY` - Secret used to sign JWT tokens (required).
- `MONGO_URI` - MongoDB connection string (defaults to `mongodb://127.0.0.1:27017/hr-system`).
- `CLIENT_URL` - Frontend origin allowed by CORS (defaults to `http://localhost:5173`).

Seed account env vars (optional for local dev):

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `HR_EMAIL`, `HR_PASSWORD`
- `EMP_EMAIL`, `EMP_PASSWORD`

## 🧪 Seeding Development Users

To create development users (admin/hr/employee) run the seeder from the `server` folder:

```pwsh
cd server
bun run seed # or `npm run seed`
```

The seeder uses default emails/passwords but will pick up the seed env vars if present.

## ✅ API Notes

- Authentication endpoints are under `/api/auth`.
- Authentication endpoints (login, refresh, logout) are rate-limited to protect against brute-force attacks.
- Protected routes expect an `Authorization: Bearer <token>` header.

## 🧰 Developer Experience & Scripts

Server scripts (in `server/package.json`):

- `dev` - Run server in development using `ts-node-dev` (hot reload).
- `start` - Run compiled server code (production).
- `seed` - Run `userSeed.ts` to populate dev users.

Client scripts (in `client/package.json`):

- `dev` - Start Vite dev server.
- `build` - Build the client app.

## ✅ Recommended Next Steps

- Add a small CI workflow to run TypeScript build and lint on PRs.
- Add basic unit/integration tests for auth and middleware.
- Consider adding refresh-token support and rotating JWTs for improved security.

## 🧾 Contributing

Please open issues or PRs. When contributing:

- Keep changes focused and small.
- Add tests where applicable.
- Run lint and TypeScript checks before committing.

If you'd like, I can add a GitHub Actions workflow and basic tests next.
