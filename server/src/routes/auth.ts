import { Router } from 'express'
import { z } from 'zod'
import type { Database } from '../types.js'
import { hashPassword, verifyPassword } from '../security/password.js'
import { requireAuth } from '../middleware/auth.js'
import { roleSchema } from '../domain.js'

interface UserRow {
  id: string
  username: string
  password_hash: string
  role: 'OWNER' | 'ADMIN'
  created_at: Date
}

const loginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(1_000),
  role: roleSchema,
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(1_000),
  nextPassword: z.string().min(12).max(1_000),
})

const attempts = new Map<string, { count: number; resetAt: number }>()

function tooManyAttempts(key: string) {
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 })
    return false
  }
  current.count += 1
  return current.count > 10
}

export function createAuthRouter(db: Database) {
  const router = Router()

  router.get('/session', (request, response) => {
    response.json({ user: request.session.user ?? null })
  })

  router.post('/login', async (request, response, next) => {
    try {
      const input = loginSchema.parse(request.body)
      const key = `${request.ip}:${input.username.toLowerCase()}`
      if (tooManyAttempts(key)) {
        response.status(429).json({ error: 'TOO_MANY_ATTEMPTS' })
        return
      }

      const result = await db.query<UserRow>(
        'SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1 AND role = $2 LIMIT 1',
        [input.username, input.role],
      )
      const user = result.rows[0]
      if (!user || !(await verifyPassword(input.password, user.password_hash))) {
        response.status(401).json({ error: 'INVALID_CREDENTIALS' })
        return
      }

      await new Promise<void>((resolve, reject) => {
        request.session.regenerate((error) => error ? reject(error) : resolve())
      })
      request.session.user = { id: user.id, username: user.username, role: user.role }
      attempts.delete(key)
      response.json({
        user: request.session.user,
        issuedAt: new Date().toISOString(),
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/logout', (request, response, next) => {
    request.session.destroy((error) => {
      if (error) {
        next(error)
        return
      }
      response.clearCookie('tf_session')
      response.status(204).end()
    })
  })

  router.post(
    '/change-password',
    requireAuth(['ADMIN', 'OWNER']),
    async (request, response, next) => {
      try {
        const input = changePasswordSchema.parse(request.body)
        const userId = request.session.user!.id
        const result = await db.query<UserRow>(
          'SELECT id, username, password_hash, role, created_at FROM users WHERE id = $1',
          [userId],
        )
        const user = result.rows[0]
        if (!user || !(await verifyPassword(input.currentPassword, user.password_hash))) {
          response.status(400).json({ error: 'CURRENT_PASSWORD_INVALID' })
          return
        }
        const passwordHash = await hashPassword(input.nextPassword)
        await db.query(
          'UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2',
          [passwordHash, userId],
        )
        response.status(204).end()
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
