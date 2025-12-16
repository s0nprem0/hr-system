<!-- Client TODOs (status reflected)

- [~] Add tests for core features (auth, employees, departments, payroll) using React Testing Library — tests added for storage/auth context (in-progress).
- [x] Harden refresh token handling and global unauthorized flow; listen for `auth:unauthorized` and log out cleanly. (Implemented in `client/src/utils/api.ts` and `client/src/context/AuthContext.tsx`)
- [ ] Add CI workflow (GitHub Actions) to run TypeScript checks, linting, and tests for server and client. (See root `.github/workflows/ci.yml`)
- [ ] Add audit log UI to view payroll/salary changes; ensure only authorized roles can access and map API audit endpoints.
- [ ] Ensure role-based UI gating: hide/disable controls based on user role in `AuthContext`.
- [ ] Implement multipart file upload UI and client-side validation for profile photos and documents.
- [ ] Add reporting UI for payroll exports (CSV/Excel) and hooks to call server export endpoints.
- [ ] Add shared TypeScript API types to a common package/folder to avoid type drift between client and server.

Notes:
- Safe storage helpers added at `client/src/utils/storage.ts`.
- API refresh queue and `auth:unauthorized` flow implemented.
-->

```
