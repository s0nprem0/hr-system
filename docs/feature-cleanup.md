Feature cleanup & system refinement — implementation notes

Scope

- Capture concrete code-level changes and small refactors to make the prototype safer, clearer, and easier to demo.

What I changed (planned/recorded tasks)

1. Documentation: created this document with explicit, actionable cleanup tasks.
2. Tracked progress in the workspace TODO list (marked report done, audit started).

Implemented (quick wins)

- `ALLOW_SEED` gating already present in `server/userSeed.ts` (explicit allow required).
- API response helpers exist in `server/utils/apiResponse.ts` (`sendSuccess` / `sendError`).
- Payroll/employee lists use `MaskedValue` to hide sensitive fields; reveal is audited.
- Improved `Resume` behavior in `client/src/components/EmployeeFormStepper.tsx` to focus the first field and switch to the first step.

Short actionable code tasks (prioritized)

1. Gate dev/seed scripts and prototype-only endpoints

   - Add an environment guard in `server/userSeed.ts` and any route that exposes development utilities.
   - Ensure `server/package.json` `seed` script remains but is not exposed via HTTP routes.
   - Implementation: check `process.env.NODE_ENV !== 'production'` or require an explicit `ALLOW_SEED=true` env var.

2. Consolidate UI list components

   - Extract or reuse `DataTable` for all list views (Employees, Payroll, Audits). Use server-side paging and a single column config.
   - Replace duplicated table code with `DataTable` usages; centralize filters.

3. Make dev-only UI controls conditional

   - Hide debug links, seed buttons, and admin-only demos unless `NODE_ENV !== 'production'` OR the logged-in user has `Admin`.

4. Draft UX: explicit resume affordance

   - On `Employee` create route, show a prominent `Resume draft` CTA when local or server draft exists.
   - Add a clear “Discard draft” confirmation.

5. Validation & feedback

   - Standardize server response envelope and add structured field-level errors: `{ success, data, error: { message, fields?: { field: message } } }`.
   - Display field-level server errors under inputs, not only toasts.

6. Quick security hardening

   - Ensure temporary password is only shown once and add `copy-to-clipboard` plus a mail-send toggle for demos.
   - Mask payroll-sensitive fields in lists; show full details only on profile with proper RBAC.

7. Tests & CI
   - Add integration tests for draft endpoints and create-flow; add axe-core accessibility checks to CI for main pages.

Implementation notes and code pointers

- Server

  - Files to change: `server/userSeed.ts`, `server/routes/*` (scan for prototype endpoints), `server/controllers/*` (standardize error format).
  - Env gating: prefer `ALLOW_SEED=true` for local dev explicitly to avoid accidental runs in shared environments.

- Client
  - Files to change: `client/src/pages/*`, `client/src/components/*` (where DataTable duplicates), `client/src/components/EmployeeFormStepper.tsx` (add resume-draft CTA and copy-to-clipboard), `client/src/utils/api.ts` (standardize envelope handling).
  - UI: add `Resume draft` component that reads `localStorage` and server draft endpoint and prompts user.

Acceptance criteria for each quick task

- No prototype-only endpoint is callable in production-like env without explicit env var.
- Draft resume appears when draft exists and restores form state reliably.
- Field-level errors appear inline when server validation fails.
- Temporary password modal provides `Copy` and only stores password in memory, not persisted.

Next steps I can run now (pick any):

- Implement `ALLOW_SEED` gating in `server/userSeed.ts` (safe, small change).
- Add `Resume draft` CTA and copy-to-clipboard button to `client/src/components/EmployeeFormStepper.tsx`.
- Extract a small `DataTable` wrapper for reuse in one list page as a demo.

Notes

- I will not run servers or installs unless you ask; these edits are small and safe and can be applied incrementally.
