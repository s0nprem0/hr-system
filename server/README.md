# server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

Notes
-----

- Refresh tokens are stored in the database with an `expiresAt` field. A TTL index has been added on `expiresAt` so MongoDB will automatically remove expired refresh tokens.
- The server now standardizes error responses via `sendError(...)` from `server/utils/apiResponse.ts`. The centralized error handler uses this helper so all API errors follow the same JSON shape: `{ success: false, error: { message: string, details?: any } }`.

Developer tips
--------------

- The server dev script uses `tsx` for a fast zero-config TypeScript runtime. Install and run:

```bash
# from server/
npm install -D tsx
npm run dev
```

If you prefer a compile step, use `tsc` + `nodemon` instead.
