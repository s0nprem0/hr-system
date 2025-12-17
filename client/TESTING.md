Running tests

This project uses Vitest (jsdom) by default for component tests.

Running tests with Bun

A minimal Bun test setup is included at `tests/setup-bun.ts` that polyfills a small
subset of browser globals required by tests (`window`, `document`, `CustomEvent`,
and `localStorage`). Use the Bun runner when you prefer a Bun-native test run.

Commands

```bash
cd client
# Run with Bun
bun test

# Run with npm/Vitest (jsdom)
npm test
```

Notes

- The Bun setup is intentionally minimal and intended for CI or Bun-native workflows.
- If you see DOM-related errors, use `npm test` to run tests under Vitest/jsdom.
