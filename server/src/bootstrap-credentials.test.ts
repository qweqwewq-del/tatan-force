// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { DataType, newDb } from 'pg-mem'
import { describe, expect, it } from 'vitest'
import {
  applyOneTimeCredentialReset,
  credentialResetTokenDigest,
  ensureBootstrapAccounts,
} from './bootstrap-credentials.js'
import { loadConfig } from './config.js'
import { verifyPassword } from './security/password.js'
import type { Database } from './types.js'

function createTestDatabase(): Database {
  const memory = newDb()
  memory.public.registerFunction({
    name: 'gen_random_uuid',
    returns: DataType.uuid,
    implementation: randomUUID,
  })
  memory.public.none(`
    CREATE TABLE users (
      id uuid PRIMARY KEY,
      username text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      role text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE credential_reset_tokens (
      token_digest text PRIMARY KEY,
      used_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE user_sessions (
      sid varchar PRIMARY KEY,
      sess json NOT NULL,
      expire timestamp NOT NULL
    );
    CREATE TABLE security_audit_events (
      id uuid PRIMARY KEY,
      event_type text NOT NULL,
      actor_user_id uuid,
      actor_username text NOT NULL,
      actor_role text NOT NULL,
      target_user_id uuid,
      target_username text,
      target_role text,
      subject_id text,
      occurred_at timestamptz NOT NULL DEFAULT now()
    );
  `)
  const adapter = memory.adapters.createPg()
  const pool = new adapter.Pool()
  return {
    query(text, values) {
      if (text.includes('INSERT INTO users')) {
        const [username, passwordHash, role] = values ?? []
        return pool.query(
          `INSERT INTO users (id, username, password_hash, role)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (username) DO NOTHING`,
          [randomUUID(), username, passwordHash, role],
        )
      }
      return pool.query(text, values ? [...values] : undefined)
    },
    async transaction(work) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await work(client)
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
  }
}

describe('one-time deployment credential reset', () => {
  it('rotates both credentials once and records no reusable token value', async () => {
    const db = createTestDatabase()
    const initial = loadConfig({
      OWNER_PASSWORD: 'InitialOwner!2026',
      ADMIN_INITIAL_PASSWORD: 'InitialAdmin!2026',
    })
    await ensureBootstrapAccounts(db, initial)

    const reset = loadConfig({
      OWNER_PASSWORD: 'RecoveredOwner!2026',
      ADMIN_INITIAL_PASSWORD: 'RecoveredAdmin!2026',
      CREDENTIAL_RESET_TOKEN: 'recovery-token-which-is-long-enough',
    })
    expect(await applyOneTimeCredentialReset(db, reset)).toBe(true)
    expect(await applyOneTimeCredentialReset(db, reset)).toBe(false)

    const users = await db.query<{ username: string; password_hash: string }>(
      'SELECT username, password_hash FROM users ORDER BY username',
    )
    const admin = users.rows.find((user) => user.username === 'tatan_admin')!
    const owner = users.rows.find((user) => user.username === 'tatan_master')!
    expect(await verifyPassword('RecoveredAdmin!2026', admin.password_hash)).toBe(true)
    expect(await verifyPassword('RecoveredOwner!2026', owner.password_hash)).toBe(true)

    const tokens = await db.query<{ token_digest: string }>(
      'SELECT token_digest FROM credential_reset_tokens',
    )
    expect(tokens.rows).toEqual([
      { token_digest: credentialResetTokenDigest('recovery-token-which-is-long-enough') },
    ])
    expect(tokens.rows[0]?.token_digest).not.toContain('recovery-token-which-is-long-enough')
  })
})
