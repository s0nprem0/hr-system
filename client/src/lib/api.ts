// Small API helper that respects VITE_API_BASE when provided.
// Usage: apiFetch('/api/metrics') or apiFetch('/api/approvals/1/approve', { method: 'POST' })
export function apiFetch(input: string, init?: RequestInit) {
	const base = (import.meta.env.VITE_API_BASE as string) ?? ''
	const trimmed = base.endsWith('/') ? base.slice(0, -1) : base
	const url = trimmed ? `${trimmed}${input}` : input
	return fetch(url, init)
}

export async function apiGetJson<T = unknown>(path: string) {
	const res = await apiFetch(path)
	if (!res.ok) throw new Error(await res.text())
	return (await res.json()) as T
}

export async function apiPostJson<T = unknown>(path: string, body?: unknown) {
	const res = await apiFetch(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	})
	if (!res.ok) throw new Error(await res.text())
	return (await res.json()) as T
}
