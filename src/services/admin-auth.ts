import type {
  AdminRole,
  AdminUser,
  AuthSession,
} from '../models/admin'

export const ADMIN_USERS_STORAGE_KEY = 'tatan-force-admin-users'
export const ADMIN_SESSION_STORAGE_KEY = 'tatan-force-admin-session'
const STORAGE_VERSION = 1
const OWNER_USERNAME = 'tatan_master'
const DEFAULT_ADMIN_USERNAME = 'tatan_admin'
const DEFAULT_ADMIN_PASSWORD = 'TatanAdmin!2026'

interface StoredAdminUsers {
  version: typeof STORAGE_VERSION
  users: AdminUser[]
}

interface SeedOptions {
  adminUsername?: string
  adminPassword?: string
}

function localStorageSafe(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function sessionStorageSafe(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

function isRole(value: unknown): value is AdminRole {
  return value === 'OWNER' || value === 'ADMIN'
}

function isAdminUser(value: unknown): value is AdminUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const user = value as Record<string, unknown>
  return (
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.passwordHash === 'string' &&
    isRole(user.role) &&
    typeof user.createdAt === 'string'
  )
}

function isSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const session = value as Record<string, unknown>
  return (
    typeof session.userId === 'string' &&
    typeof session.username === 'string' &&
    isRole(session.role) &&
    typeof session.issuedAt === 'string'
  )
}

/**
 * Lightweight deterministic digest for the local-only prototype.
 * Replace this adapter with a server-side password hash before deployment.
 */
export function hashLocalPassword(password: string): string {
  let hash = 2166136261

  for (let index = 0; index < password.length; index += 1) {
    hash ^= password.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `local-v1-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function ownerPassword() {
  return import.meta.env.VITE_OWNER_PASSWORD?.trim() ?? ''
}

export function seedAdminUsers(options: SeedOptions = {}): AdminUser[] {
  const storage = localStorageSafe()
  const existing = readAdminUsers()

  if (existing.length > 0 || !storage) {
    return existing
  }

  const createdAt = new Date().toISOString()
  const users: AdminUser[] = [
    {
      id: 'owner-tatan-master',
      username: OWNER_USERNAME,
      passwordHash: 'deployment-configured',
      role: 'OWNER',
      createdAt,
    },
    {
      id: 'admin-tatan-primary',
      username:
        options.adminUsername ??
        import.meta.env.VITE_ADMIN_USERNAME ??
        DEFAULT_ADMIN_USERNAME,
      passwordHash: hashLocalPassword(
        options.adminPassword ??
          import.meta.env.VITE_ADMIN_INITIAL_PASSWORD ??
          DEFAULT_ADMIN_PASSWORD,
      ),
      role: 'ADMIN',
      createdAt,
    },
  ]

  storage.setItem(
    ADMIN_USERS_STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, users } satisfies StoredAdminUsers),
  )
  return users
}

export function readAdminUsers(): AdminUser[] {
  const storage = localStorageSafe()

  if (!storage) {
    return []
  }

  try {
    const raw = storage.getItem(ADMIN_USERS_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as Record<string, unknown>).version !== STORAGE_VERSION
    ) {
      return []
    }

    const users = (parsed as Record<string, unknown>).users
    return Array.isArray(users) && users.every(isAdminUser) ? users : []
  } catch {
    return []
  }
}

function writeAdminUsers(users: readonly AdminUser[]) {
  const storage = localStorageSafe()

  if (!storage || !users.every(isAdminUser)) {
    return false
  }

  try {
    storage.setItem(
      ADMIN_USERS_STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        users: [...users],
      } satisfies StoredAdminUsers),
    )
    return true
  } catch {
    return false
  }
}

export function authenticate(
  username: string,
  password: string,
  expectedRole: AdminRole,
  configuredOwnerPassword = ownerPassword(),
): AuthSession | null {
  const users = seedAdminUsers()
  const user = users.find(
    (candidate) =>
      candidate.username === username.trim() && candidate.role === expectedRole,
  )

  if (!user) {
    return null
  }

  const valid =
    expectedRole === 'OWNER'
      ? configuredOwnerPassword.length > 0 &&
        password === configuredOwnerPassword
      : user.passwordHash === hashLocalPassword(password)

  if (!valid) {
    return null
  }

  const session: AuthSession = {
    userId: user.id,
    username: user.username,
    role: user.role,
    issuedAt: new Date().toISOString(),
  }
  saveSession(session)
  return session
}

export function readSession(): AuthSession | null {
  const storage = sessionStorageSafe()

  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(ADMIN_SESSION_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): boolean {
  const storage = sessionStorageSafe()

  if (!storage || !isSession(session)) {
    return false
  }

  try {
    storage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session))
    return true
  } catch {
    return false
  }
}

export function clearSession(): boolean {
  const storage = sessionStorageSafe()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(ADMIN_SESSION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function changeAdminPassword(
  userId: string,
  currentPassword: string,
  nextPassword: string,
): boolean {
  const users = readAdminUsers()
  const user = users.find(
    (candidate) => candidate.id === userId && candidate.role === 'ADMIN',
  )

  if (
    !user ||
    user.passwordHash !== hashLocalPassword(currentPassword) ||
    nextPassword.length < 8
  ) {
    return false
  }

  return writeAdminUsers(
    users.map((candidate) =>
      candidate.id === userId
        ? { ...candidate, passwordHash: hashLocalPassword(nextPassword) }
        : candidate,
    ),
  )
}

export function resetAdminPassword(
  adminId: string,
  nextPassword: string,
): boolean {
  const users = readAdminUsers()
  const target = users.find(
    (candidate) => candidate.id === adminId && candidate.role === 'ADMIN',
  )

  if (!target || nextPassword.length < 8) {
    return false
  }

  return writeAdminUsers(
    users.map((candidate) =>
      candidate.id === adminId
        ? { ...candidate, passwordHash: hashLocalPassword(nextPassword) }
        : candidate,
    ),
  )
}
