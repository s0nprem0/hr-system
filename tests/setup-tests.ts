/* eslint-disable */
// @ts-nocheck
// Lightweight test environment polyfills for running client tests (Vitest/Bun).
// Exposes minimal `window`, `document`, `localStorage`, and `CustomEvent` if missing.

declare global {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	var localStorage: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	var Storage: any
}

if (typeof globalThis.window === 'undefined') {
	// expose a `window` alias to globalThis for libs that read `window`.
	// @ts-ignore
	globalThis.window = globalThis
}

if (typeof globalThis.document === 'undefined') {
	const element = () => ({
		appendChild: (_child: unknown) => _child,
		removeChild: (_child: unknown) => undefined,
		innerHTML: '',
		children: [] as unknown[],
	})
	// @ts-expect-error - lightweight test shim
	globalThis.document = {
		createElement: (_: string) => element(),
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
		body: element(),
	}
}

if (typeof globalThis.CustomEvent === 'undefined') {
	// minimal CustomEvent implementation for tests that dispatch custom events
	// @ts-ignore
	globalThis.CustomEvent = function CustomEvent(type: string, init?: any) {
		this.type = type
		this.detail = init?.detail
	}
}

// Provide a simple in-memory Storage if localStorage isn't available or is incomplete
const needsStoragePolyfill = (() => {
	try {
		const ls = (globalThis as any).localStorage
		if (!ls) return true
		return (
			typeof ls.getItem !== 'function' ||
			typeof ls.setItem !== 'function' ||
			typeof ls.removeItem !== 'function'
		)
	} catch {
		return true
	}
})()

if (needsStoragePolyfill) {
	class TestStorage {
		private store = new Map<string, string>()
		get length() {
			return this.store.size
		}
		key(i: number) {
			return Array.from(this.store.keys())[i] ?? null
		}
		getItem(k: string) {
			return this.store.has(k) ? (this.store.get(k) as string) : null
		}
		setItem(k: string, v: string) {
			this.store.set(k, String(v))
		}
		removeItem(k: string) {
			this.store.delete(k)
		}
		clear() {
			this.store.clear()
		}
	}
	// @ts-expect-error - test polyfill
	globalThis.Storage = TestStorage
	// @ts-expect-error - test polyfill
	globalThis.localStorage = new TestStorage()
}

// Ensure window.location has minimal shape expected by libraries (axios, routers)
if (
	typeof (globalThis as unknown as Record<string, unknown>).location ===
		'undefined' ||
	typeof ((globalThis as unknown as Record<string, unknown>).location as any)
		?.href === 'undefined'
) {
	// simple mutable location object for tests
	// @ts-expect-error - test polyfill assignment
	;(globalThis as unknown as Record<string, unknown>).location = {
		href: 'http://localhost',
		replace: (_p: string) => {
			/* noop */
		},
	}
}
