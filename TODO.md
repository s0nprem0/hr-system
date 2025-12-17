# Project TODOs (Consolidated)

## 🚨 High Priority (Blockers / Core Quality)

### 1. UI Primitives Consolidation
- [ ] Create a single UI barrel (`components/ui/index.ts`)
- [ ] Unify styles and APIs for shared components:
  - `Button`
  - `Input`
  - `Select`
  - `Textarea`
  - etc.
- [ ] Replace legacy imports across the client
- [ ] Remove inline styles and magic strings
- [ ] Deduplicate repeated markup into reusable components

---

### 2. TypeScript Hardening
- [ ] Tighten types in `shared/src`
- [ ] Tighten API request/response types
- [ ] Harden component prop types
- [ ] Incrementally enable `strict`
- [ ] Remove `any`, unsafe unions, and implicit `null | undefined`

---

### 3. Auth Redirect Centralization
- [ ] Complete router-based redirects in `AuthContext`
- [ ] Fully wire `handleUnauthorized`
- [ ] Remove page-level auth redirect logic
- [ ] Ensure consistent behavior on refresh / expired sessions

---

## 🧪 Testing & CI

### 4. Test Setup Cleanup
- [ ] Move Bun test shims into `tests/setup-tests.ts`
- [ ] Share setup between Vitest, Jest, and CI
- [ ] Ensure `bun test` and Vitest both pass cleanly

---

### 5. E2E Smoke Tests
- [ ] Add Playwright or Cypress
- [ ] Add smoke coverage for:
  - Login
  - Lists (employees, departments)
  - Forms (create/edit flows)

---

### 6. CI / Lint / Format Enforcement
- [ ] Add GitHub Actions pipeline:
  - `bun test`
  - `eslint`
  - `prettier`
- [ ] Enable pre-commit hooks
- [ ] Fail CI on lint or type errors

---

## ♿ UX & Maintainability

### 7. Accessibility Audit
- [ ] Run a full a11y audit
- [ ] Fix issues in:
  - `Navbar`
  - `Dialog`
  - Forms
  - DataTable
- [ ] Add aria attributes where missing
- [ ] Improve keyboard navigation and focus management

---

### 8. Remove Remaining UI Anti-Patterns
- [ ] Replace inline styles
- [ ] Remove duplicated layouts and markup
- [ ] Eliminate hardcoded role strings
- [ ] Prefer shared components and helpers

---

## 🧠 Strategic / Nice-to-Have

### 9. Repo & Tooling Modernization
- [ ] Convert to monorepo (pnpm workspaces / Turbo / Nx)
- [ ] Standardize on `pnpm` (optional `bun` runtime)
- [ ] Improve CI caching and artifacts (coverage)

---

### 10. Observability & Security
- [ ] Add structured logging (Pino)
- [ ] Integrate error tracking (Sentry)
- [ ] Add metrics (Prometheus or hosted APM)
- [ ] Enable secret scanning and Dependabot
- [ ] Tighten CORS and runtime secret validation

---

### 11. Infra & Deployment
- [ ] Add Dockerfiles for client and server
- [ ] Add `docker-compose` for local development
- [ ] Add readiness and liveness probes for Kubernetes
