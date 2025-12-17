/* eslint-disable */
// @ts-nocheck
import './setup-bun'
import { describe, it, expect, vi } from 'vitest'
import { safeGetItem } from '../src/utils/storage'
import { handleUnauthorized } from '../src/context/AuthContext'

describe('AuthContext unauthorized handling', () => {
  it('clears storage and redirects when handleUnauthorized is called', () => {
    // set tokens in storage
    globalThis.localStorage.setItem('token', 'tok')
    globalThis.localStorage.setItem('refreshToken', 'r')

    const originalLocation = (globalThis as unknown as Record<string, unknown>).location
    const replaceMock = vi.fn()
    // @ts-expect-error assign test location for environment without DOM
    ;(globalThis as unknown as Record<string, unknown>).location = { ...(originalLocation as any), replace: replaceMock }

    handleUnauthorized()

    expect(replaceMock).toHaveBeenCalledWith('/login')
    expect(safeGetItem('token')).toBeNull()

    // restore
    // @ts-expect-error restore original location
    globalThis.location = originalLocation as any
  })
})
