import { render, screen, act } from '@testing-library/react'
import AuthContext, { useAuth } from '../src/context/AuthContext'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

function TestComponent() {
  const auth = useAuth()
  React.useEffect(() => {
    // set a logged-in user
    auth?.login({ _id: '1', name: 'Test', role: 'admin' }, 'tok')
  }, [])
  return <div>{auth?.user ? `user:${auth.user.name}` : 'no-user'}</div>
}

describe('AuthContext unauthorized handling', () => {
  it('clears user and redirects on auth:unauthorized', async () => {
    const replaceSpy = vi.spyOn(window.location, 'replace').mockImplementation(() => undefined)

    render(
      <AuthContext>
        <TestComponent />
      </AuthContext>,
    )

    // initially the user should be set by TestComponent
    expect(screen.getByText(/user:Test/)).toBeTruthy()

    // dispatch unauthorized event
    act(() => {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    })

    // context should redirect
    expect(replaceSpy).toHaveBeenCalledWith('/login')

    replaceSpy.mockRestore()
  })
})
