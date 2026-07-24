// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { loadConfig } from './config.js'

describe('production configuration', () => {
  it('rejects development credentials in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(
      'Production secrets must be replaced',
    )
  })

  it('accepts an explicit secure production configuration', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgres://user:pass@db:5432/tatan',
      SESSION_SECRET: 'a-secure-session-secret-with-32-characters',
      OWNER_PASSWORD: 'OwnerProduction!2026',
      ADMIN_INITIAL_PASSWORD: 'AdminProduction!2026',
      STORAGE_DRIVER: 'local',
      APP_ORIGIN: 'https://tatan.example.com',
    })
    expect(config.COOKIE_SECURE).toBe(false)
    expect(config.NODE_ENV).toBe('production')
  })
})
