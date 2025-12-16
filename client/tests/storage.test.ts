import { describe, it, expect, vi } from 'vitest'
import { safeGetItem, safeSetItem, safeRemoveItem } from '../src/utils/storage'

describe('storage helpers', () => {
  it('safeSetItem returns false when storage throws', () => {
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    const ok = safeSetItem('k', 'v')
    expect(ok).toBe(false)
    set.mockRestore()
  })

  it('safeGetItem returns null when storage throws', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('err') })
    const res = safeGetItem('k')
    expect(res).toBeNull()
    get.mockRestore()
  })

  it('safeRemoveItem returns false when storage throws', () => {
    const rm = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('err') })
    const ok = safeRemoveItem('k')
    expect(ok).toBe(false)
    rm.mockRestore()
  })
})
