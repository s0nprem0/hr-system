# Client TODOs

Current status of high-priority refactors and improvements (tracked):

- [x] Centralize permission types and helpers
  - `client/src/context/AuthPermissions.ts` added; exposes `getPermissions`, `canRole`, and `formatRole`.
- [x] Unify page layout wrapper
  - `client/src/components/layout/PageContainer.tsx` added; many pages migrated to the new layout.
- [ ] Consolidate shared UI primitives
  - Add a single barrel and unify styles for `Button`, `Input`, `Select`, `Textarea`, etc.
- [x] Extract API client & typed hooks
  - Small typed hooks added (`client/src/utils/useEmployees.ts`, `client/src/utils/useDepartments.ts`) and API client centralized.
- [~] Improve test setup & cross-runner support (in-progress)
  - Bun-friendly test shims added; consolidate into a shared `tests/setup-tests.ts` for Vitest/Jest and CI.
- [ ] Harden TypeScript types
  - Tighten types across `shared/src`, API responses, and component props; enable `strict` incrementally.
- [~] Centralize auth redirect handling (in-progress)
  - `handleUnauthorized` helper exists; aim to complete router-based redirects inside `AuthContext`.
- [ ] Accessibility audit & fixes
  - Run an a11y pass (aria attributes, keyboard handling, focus management) and fix issues in `Navbar`, `Dialog`, forms, and DataTable.
- [~] Remove UI anti-patterns (in-progress)
  - Replace inline styles, magic strings, and duplicated markup with reusable components.
- [ ] Add E2E smoke tests
  - Add Playwright or Cypress smoke tests for core flows (login, lists, forms).
- [x] Tailwind theme & tokens cleanup
  - Move design tokens into `client/src/styles/tokens.css` and ensure `tailwind.config.js` imports them.
- [ ] CI / lint / format enforcement
  - Add GitHub Actions pipeline to run `bun test`, `eslint`, and `prettier`; enable pre-commit hooks.

Notes / recent changes:
- Centralized permissions: `client/src/context/AuthPermissions.ts` (+ `formatRole`).
- UI layout: `PageContainer` implemented and applied across pages.
- Role displays converted to friendly labels (`formatRole`) across Dashboard, EmployeesList, Profile, Users, EmployeeDetail.
- Replaced direct `.role` checks with permission helpers (`auth.can`, `auth.hasAnyRole`) in pages and `PrivateRoutes`.
- Added unit tests for `AuthPermissions` and overall tests passing locally (`bun test` — 7 passed, 0 failed).

Next actions (recommended):
- Finish consolidating UI primitives and update imports across the codebase.
- Move Bun test shims into a shared `tests/setup-tests.ts` and wire into CI.
- Run a TypeScript strictness pass and incrementally enable `strict` where feasible.

If you'd like, I can open a PR with these changes and the commit, or continue with the UI primitives consolidation next.
