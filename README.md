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

- Run tests
- Fix lint issues
- Keep commits clean and focused

---
