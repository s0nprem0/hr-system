import { describe, it, expect } from 'vitest'
import { getPermissions, PERMISSIONS_MAP } from '../src/context/AuthPermissions'

describe('AuthPermissions', () => {
	it('returns permissions for admin role', () => {
		const perms = getPermissions('admin')
		// admin should have at least the permissions defined in PERMISSIONS_MAP.admin
		expect(perms).toEqual(expect.objectContaining(PERMISSIONS_MAP.admin))
	})

	it('returns permissions for hr role', () => {
		const perms = getPermissions('hr')
		expect(perms).toEqual(expect.objectContaining(PERMISSIONS_MAP.hr))
	})

	it('returns empty object for unknown role', () => {
		const perms = getPermissions(null)
		expect(perms).toEqual({})
	})
})
