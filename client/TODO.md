# Client TODOs

Current status of high-priority refactors and improvements (tracked):

- [ ] Centralize permission types and helpers
  - Move role/permission definitions and helper functions into `client/src/context/AuthPermissions.ts` (or extend `AuthContext.tsx`) so UI and server use a single source of truth.
- [x] Unify page layout wrapper
  - Create a single `PageContainer` component and replace repeated `container-main`/`space-y-6` markup in pages under `client/src/pages/`. (In progress — several pages updated)
- [ ] Consolidate shared UI primitives
  - Standardize and export tokens/styles from `client/src/components/ui/*` (Button/Input/Select/Textarea/etc.) and remove duplicate CSS classes across components. (Barrel file added)
- [ ] Extract API client & typed hooks
  - Centralize API calls in `client/src/utils/api.ts` with typed wrappers and add typed hooks (useEmployees, useDepartments) to reduce duplicate data-fetching code. (small hooks added)
- [ ] Improve test setup & cross-runner support
  - Move Bun polyfill into a single `tests/setup-tests.ts` and configure Vitest/Jest to reuse it; add CI-friendly test configs and add unit tests for core components.
- [ ] Harden TypeScript types
  - Tighten types across `shared/src`, API responses, and component props (avoid `any`/loose records), enable `strict` where possible, and add type tests for contracts in `shared/src`.
- [ ] Centralize auth redirect handling
  - Move `handleUnauthorized` and redirect logic into `AuthContext` with consistent behavior (router `navigate`) and tests; remove `window.location` usages.
- [ ] Accessibility audit & fixes
  - Run an a11y pass (aria attributes, keyboard handling, focus management) and fix issues in `Navbar`, `Dialog`, forms, and DataTable.
- [ ] Remove UI anti-patterns
  - Find and replace inline styles, magic strings, and duplicated markup (e.g., repeated form layout, card wrappers) with reusable components.
- [ ] Add E2E smoke tests
  - Add simple Playwright or Cypress smoke tests that navigate key flows (login, list pages, create/edit forms) to catch regressions early.
- [ ] Tailwind theme & tokens cleanup
  - Move design tokens into a single `client/src/styles/tokens.css`, ensure `tailwind.config.js` imports those tokens, and remove ad-hoc CSS variables.
- [ ] CI / lint / format enforcement
  - Add GitHub Actions pipeline to run `bun test`, `eslint`, and `prettier` (or `npm run format`), and enable pre-commit hooks to keep code consistent.

Notes / recent changes:
- `client/src/context/AuthPermissions.ts` added to centralize permissions.
- `client/src/components/layout/PageContainer.tsx` added and pages migrated to the new layout.
- `client/src/components/ui/index.ts` barrel export added for UI primitives.
- Small typed hooks added: `client/src/utils/useEmployees.ts`, `client/src/utils/useDepartments.ts`.
- Bun-friendly test adjustments and small tests remain passing locally (`bun test` — 4 passed, 0 failed).

Next actions:
- Finish consolidating UI primitives and update imports across components.
- Harden TypeScript types and add type tests for shared contracts.
- Implement CI and central test setup for cross-runner support.
<!-- Client TODOs (status reflected)

- [~] Add tests for core features (auth, employees, departments, payroll) using React Testing Library — tests added for storage/auth context (in-progress).
- [x] Harden refresh token handling and global unauthorized flow; listen for `auth:unauthorized` and log out cleanly. (Implemented in `client/src/utils/api.ts` and `client/src/context/AuthContext.tsx`)
- [ ] Add CI workflow (GitHub Actions) to run TypeScript checks, linting, and tests for server and client. (See root `.github/workflows/ci.yml`)
 - [x] Add CI workflow (GitHub Actions) to run TypeScript checks, linting, and tests for server and client. (See root `.github/workflows/ci.yml`)
- [ ] Add audit log UI to view payroll/salary changes; ensure only authorized roles can access and map API audit endpoints.
- [ ] Ensure role-based UI gating: hide/disable controls based on user role in `AuthContext`.
- [ ] Implement multipart file upload UI and client-side validation for profile photos and documents.
- [ ] Add reporting UI for payroll exports (CSV/Excel) and hooks to call server export endpoints.
 - [x] Add shared TypeScript API types to a common package/folder to avoid type drift between client and server. (See `shared/src/index.ts`)

Notes:
- Safe storage helpers added at `client/src/utils/storage.ts`.
- API refresh queue and `auth:unauthorized` flow implemented.
-->

```
