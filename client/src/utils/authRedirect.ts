import { safeGetItem, safeSetItem, safeRemoveItem } from './storage'
import type { NavigateFunction } from 'react-router-dom'

const REDIRECT_KEY = 'postLoginRedirect'

export function setPostLoginRedirect(path: string) {
	try {
		safeSetItem(REDIRECT_KEY, path)
	} catch {
		// ignore
	}
}

export function getAndClearPostLoginRedirect(): string | null {
	try {
		const v = safeGetItem(REDIRECT_KEY)
		safeRemoveItem(REDIRECT_KEY)
		return v || null
	} catch {
		return null
	}
}

export function redirectToLogin(
	navigate?: NavigateFunction,
	currentPath?: string
) {
	const path =
		currentPath ??
		(typeof window !== 'undefined'
			? window.location.pathname + (window.location.search || '')
			: '/')
	setPostLoginRedirect(path)
	if (navigate) {
		navigate('/login')
	} else if (
		typeof window !== 'undefined' &&
		typeof window.location?.replace === 'function'
	) {
		window.location.replace('/login')
	}
}

export function handleUnauthorized(redirectFn?: (path: string) => void) {
	try {
		safeRemoveItem('token')
		// refresh token is stored in an httpOnly cookie; no client-side cleanup needed
	} catch {
		// ignore
	}
	if (redirectFn) {
		redirectFn('/login')
	} else {
		redirectToLogin()
	}
}
