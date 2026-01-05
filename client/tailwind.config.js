/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: 'var(--cp-primary)',
				'primary-foreground': 'var(--cp-primary-foreground)',
				cta: 'var(--cp-cta)',
				'cta-foreground': 'var(--cp-cta-foreground)',
				'cta-hover': 'var(--cp-cta-hover)',
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
			spacing: {
				1: 'var(--space-1)',
				2: 'var(--space-2)',
				3: 'var(--space-3)',
				4: 'var(--space-4)',
				5: 'var(--space-5)',
				6: 'var(--space-6)',
			},
			borderRadius: {
				sm: 'var(--radius-sm)',
				md: 'var(--radius-md)',
				lg: 'var(--radius-lg)',
			},
			fontSize: {
				base: 'var(--font-size-base)',
				lg: 'var(--font-size-lg)',
				sm: 'var(--font-size-sm)',
			},
			ringColor: {
				DEFAULT: 'var(--cp-cta)',
			},
			ringWidth: {
				DEFAULT: '2px',
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui'],
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
