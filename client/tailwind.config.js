/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--cp-primary)',
        'primary-foreground': 'var(--cp-primary-foreground)',
        background: 'var(--cp-bg)',
        surface: 'var(--cp-surface)',
        muted: 'var(--cp-muted)',
        accent: 'var(--cp-accent)',
        'accent-foreground': 'var(--cp-accent-foreground)',
        border: 'var(--cp-border)',
        success: 'var(--cp-success)',
        warning: 'var(--cp-warning)',
        danger: 'var(--cp-danger)',
      },
    },
  },
  safelist: [
    // ensure bracketed var classes and placeholder variants are preserved
    { pattern: /^text-\[var\(--cp-[\w-]+\)\]$/ },
    { pattern: /^placeholder:text-\[var\(--cp-[\w-]+\)\]$/ },
    // preserve background/border var classes used by components
    { pattern: /^bg-\[var\(--cp-[\w-]+\)\]$/ },
    { pattern: /^border-\[var\(--cp-[\w-]+\)\]$/ },
  ],
  plugins: [],
}
