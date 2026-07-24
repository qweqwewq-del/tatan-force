import { describe, expect, it } from 'vitest'
import {
  authenticate,
  changeAdminPassword,
  readSession,
  resetAdminPassword,
  seedAdminUsers,
} from './admin-auth'

describe('admin auth service', () => {
  it('authenticates ADMIN and allows changing only the current password', () => {
    const users = seedAdminUsers({
      adminUsername: 'merchant',
      adminPassword: 'initial-pass',
    })
    const admin = users.find((user) => user.role === 'ADMIN')

    expect(authenticate('merchant', 'initial-pass', 'ADMIN')).toMatchObject({
      role: 'ADMIN',
      username: 'merchant',
    })
    expect(readSession()?.role).toBe('ADMIN')
    expect(
      changeAdminPassword(admin?.id ?? '', 'initial-pass', 'updated-pass'),
    ).toBe(true)
    expect(authenticate('merchant', 'initial-pass', 'ADMIN')).toBeNull()
    expect(authenticate('merchant', 'updated-pass', 'ADMIN')?.role).toBe(
      'ADMIN',
    )
  })

  it('requires deployment password and correct role for OWNER', () => {
    const users = seedAdminUsers({
      adminUsername: 'merchant',
      adminPassword: 'initial-pass',
    })
    const admin = users.find((user) => user.role === 'ADMIN')

    expect(
      authenticate('tatan_master', 'owner-secret', 'OWNER', ''),
    ).toBeNull()
    expect(
      authenticate('tatan_master', 'owner-secret', 'ADMIN', 'owner-secret'),
    ).toBeNull()
    expect(
      authenticate(
        'tatan_master',
        'owner-secret',
        'OWNER',
        'owner-secret',
      )?.role,
    ).toBe('OWNER')
    expect(resetAdminPassword(admin?.id ?? '', 'owner-reset-pass')).toBe(true)
    expect(
      authenticate('merchant', 'owner-reset-pass', 'ADMIN')?.role,
    ).toBe('ADMIN')
  })
})
