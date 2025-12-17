<!-- Server TODOs (status reflected)

- [x] Add `/health` endpoint and basic metrics (uptime, DB connection) for monitoring and readiness. (Implemented in `server/app.ts`)
- [x] Harden refresh token handling on server: atomic validate-and-revoke rotation and idempotent logout. (Implemented in `server/controllers/authController.ts`)
- [~] Add tests for core features (auth refresh, departments, employees, payroll) using Jest + mongodb-memory-server — tests added under `server/tests/` (in-progress).
 - [x] Add CI workflow (GitHub Actions) to run TypeScript checks, linting, and tests for server and client. (See `.github/workflows/ci.yml`)
 - [ ] Add audit-log API endpoints (if additional query surface required) and admin UI to review payroll/salary changes; ensure only authorized roles can access.
 - [ ] Implement multipart file upload support for profile photos and documents with validation and storage (local or S3-compatible).
 - [ ] Implement reporting/export endpoints (CSV/Excel) for payroll summaries and add UI to generate exports.
 - [x] Add shared TypeScript API types (shared package/folder) to avoid type drift between client and server. (Added `shared/src/index.ts`)

Notes:
- Tests added: `auth.refresh.test.ts`, `auth.refresh.rotation.test.ts`, `departments.test.ts`, `employees.test.ts`, `payroll.test.ts`.
- Health endpoint returns DB state, uptime and memory; returns 503 when DB not ready.
-->
-->

## Modernization recommendations

- **Monorepo / Workspace:** consolidate `client/` and `server/` into a monorepo (pnpm workspaces, Turbo/Gradle/ Nx) to simplify cross-package scripts, shared types, and CI.
- **Package manager:** standardize on `pnpm` (or `bun` for runtime, `pnpm` for workspace installs) for faster installs, reproducible lockfiles and workspace support.
- **Shared types:** add a `packages/shared` (or `shared/`) package with API request/response types and common domain models to eliminate type drift.
- **Tests & Runners:** prefer `vitest` for client/unit tests and consider `bun test` or `vitest` for server unit tests; keep Jest only if you need its ecosystem features.
- **CI Improvements:** make CI matrix run lint/typecheck/tests, enable caching (pnpm/bun), surface artifacts (coverage reports), and add `dependabot` updates.
- **Observability:** add structured logging (Pino → remote sink), error reporting (Sentry), and metrics (Prometheus + Grafana or hosted APM) with health/readiness endpoints.
- **Security / Secrets:** add secret scanning, Dependabot, and an automated SCA step; add runtime secret validation and stricter CORS defaults.
- **Containers & Infra:** add Dockerfiles for `server` and `client`, a `docker-compose` for local development, and container readiness/liveness probes for k8s.

```
