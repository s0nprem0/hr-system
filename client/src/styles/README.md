Tokens and theme usage
======================

This folder centralizes design tokens (CSS variables) used by the client.

Files
- `tokens.css`: CSS Custom Properties (light + dark) used across the app and referenced from `tailwind.config.js`.

How to use
- Prefer tokens over hard-coded colors. Use the Tailwind mapping (e.g. `bg-[var(--cp-cta)]`, `text-[var(--cp-text)]`) or the semantic token names defined in `tailwind.config.js` (e.g. `bg-primary`, `text-muted`).
- In component CSS, prefer `background-color: var(--cp-surface)` instead of hex literals.

Dark mode
- The app toggles dark theme by adding the class `theme-catppuccin-dark` at the top level (for example on `<html>` or `<body>`). The class flips the token values defined in `tokens.css`.

Adding new tokens
- Add new semantic tokens to `tokens.css` and then reference them in `tailwind.config.js` if you need utility aliases (e.g. `colors: { primary: 'var(--cp-primary)' }`).

Notes
- Tailwind reads CSS variables at runtime — there's no build-time import. Keep token names stable to avoid breaking styles.
