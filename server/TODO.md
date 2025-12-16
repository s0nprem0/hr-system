<!-- Server TODOs (status reflected)

- [x] Add `/health` endpoint and basic metrics (uptime, DB connection) for monitoring and readiness. (Implemented in `server/app.ts`)
- [x] Harden refresh token handling on server: atomic validate-and-revoke rotation and idempotent logout. (Implemented in `server/controllers/authController.ts`)
- [~] Add tests for core features (auth refresh, departments, employees, payroll) using Jest + mongodb-memory-server — tests added under `server/tests/` (in-progress).
- [ ] Add CI workflow (GitHub Actions) to run TypeScript checks, linting, and tests for server and client.
- [ ] Add audit-log API endpoints (if additional query surface required) and admin UI to review payroll/salary changes; ensure only authorized roles can access.
- [ ] Implement multipart file upload support for profile photos and documents with validation and storage (local or S3-compatible).
- [ ] Implement reporting/export endpoints (CSV/Excel) for payroll summaries and add UI to generate exports.
- [ ] Add shared TypeScript API types (shared package/folder) to avoid type drift between client and server.

Notes:
- Tests added: `auth.refresh.test.ts`, `auth.refresh.rotation.test.ts`, `departments.test.ts`, `employees.test.ts`, `payroll.test.ts`.
- Health endpoint returns DB state, uptime and memory; returns 503 when DB not ready.
-->

```
