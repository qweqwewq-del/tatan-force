// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password.js'

describe('password hashing', () => {
  it('uses a salted scrypt digest and constant-time verification path', async () => {
    const first = await hashPassword('StrongPassword!2026')
    const second = await hashPassword('StrongPassword!2026')

    expect(first).not.toBe(second)
    expect(first.startsWith('scrypt-v1:')).toBe(true)
    expect(await verifyPassword('StrongPassword!2026', first)).toBe(true)
    expect(await verifyPassword('wrong', first)).toBe(false)
  })
})
