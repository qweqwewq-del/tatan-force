import { createHash } from 'node:crypto'
import type { AppConfig } from './config.js'
import { recordPasswordChange } from './security/audit.js'
import { hashPassword } from './security/password.js'
import type { Database, Role } from './types.js'

interface BootstrapAccount {
  username: string
  password: string
  role: Role
}

function configuredAccounts(config: AppConfig): BootstrapAccount[] {
  return [
    { username: config.OWNER_USERNAME, password: config.OWNER_PASSWORD, role: 'OWNER' },
    { username: config.ADMIN_USERNAME, password: config.ADMIN_INITIAL_PASSWORD, role: 'ADMIN' },
  ]
}

export function credentialResetTokenDigest(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function ensureBootstrapAccounts(db: Database, config: AppConfig) {
  for (const account of configuredAccounts(config)) {
    const passwordHash = await hashPassword(account.password)
    await db.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1,$2,$3)
       ON CONFLICT (username) DO NOTHING`,
      [account.username, passwordHash, account.role],
    )
  }
}

/**
 * Applies a configured credential rotation exactly once for each token digest.
 * The deployment token itself is never persisted, logged, or exposed through an API.
 */
export async function applyOneTimeCredentialReset(db: Database, config: AppConfig) {
  if (!config.CREDENTIAL_RESET_TOKEN) return false

  const accounts = configuredAccounts(config)
  const hashedAccounts = await Promise.all(accounts.map(async (account) => ({
    ...account,
    passwordHash: await hashPassword(account.password),
  })))
  const tokenDigest = credentialResetTokenDigest(config.CREDENTIAL_RESET_TOKEN)

  return db.transaction(async (client) => {
    const alreadyUsed = await client.query(
      'SELECT 1 FROM credential_reset_tokens WHERE token_digest = $1',
      [tokenDigest],
    )
    if (alreadyUsed.rowCount) return false

    const tokenClaim = await client.query<{ token_digest: string }>(
      `INSERT INTO credential_reset_tokens (token_digest)
       VALUES ($1)
       ON CONFLICT (token_digest) DO NOTHING
       RETURNING token_digest`,
      [tokenDigest],
    )
    if (!tokenClaim.rowCount) return false

    // A forced credential rotation invalidates any prior authenticated session.
    await client.query('DELETE FROM user_sessions')

    for (const account of hashedAccounts) {
      const updated = await client.query<{ id: string; username: string; role: Role }>(
        `UPDATE users
         SET password_hash = $1, updated_at = now()
         WHERE username = $2 AND role = $3
         RETURNING id, username, role`,
        [account.passwordHash, account.username, account.role],
      )
      const user = updated.rows[0]
      if (!user) {
        throw new Error(`Credential reset target was not found for role ${account.role}.`)
      }
      await recordPasswordChange(client, {
        source: 'DEPLOYMENT_RESET',
        target: user,
      })
    }

    return true
  })
}
