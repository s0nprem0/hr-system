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
  plugins: [],
}
