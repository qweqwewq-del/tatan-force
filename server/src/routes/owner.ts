import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { hashPassword } from '../security/password.js'
import { recordPasswordChange } from '../security/audit.js'
import type { Database } from '../types.js'

interface AdminRow {
  id: string
  username: string
  role: 'ADMIN'
  created_at: Date
}

interface PasswordChangeRow {
  id: string
  actor_username: string
  actor_role: string
  target_username: string
  target_role: 'ADMIN' | 'OWNER'
  subject_id: 'SELF_SERVICE' | 'OWNER_RESET' | 'DEPLOYMENT_RESET'
  occurred_at: Date
}

export function createOwnerRouter(db: Database) {
  const router = Router()
  router.use(requireAuth(['OWNER']))

  router.get('/users', async (_request, response, next) => {
    try {
      const result = await db.query<AdminRow>(
        "SELECT id, username, role, created_at FROM users WHERE role = 'ADMIN' ORDER BY created_at",
      )
      response.json({
        users: result.rows.map((row) => ({
          id: row.id,
          username: row.username,
          role: row.role,
          createdAt: row.created_at.toISOString(),
        })),
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/users', async (request, response, next) => {
    try {
      const input = z.object({
        username: z.string().trim().min(3).max(120),
        password: z.string().min(12).max(1_000),
      }).parse(request.body)
      const passwordHash = await hashPassword(input.password)
      const result = await db.query<AdminRow>(
        `INSERT INTO users (username, password_hash, role)
         VALUES ($1,$2,'ADMIN') RETURNING id, username, role, created_at`,
        [input.username, passwordHash],
      )
      const row = result.rows[0]!
      response.status(201).json({
        user: {
          id: row.id,
          username: row.username,
          role: row.role,
          createdAt: row.created_at.toISOString(),
        },
      })
    } catch (error) {
      next(error)
    }
  })

  router.put('/users/:id/password', async (request, response, next) => {
    try {
      const input = z.object({
        password: z.string().min(12).max(1_000),
      }).parse(request.body)
      const passwordHash = await hashPassword(input.password)
      const status = await db.transaction(async (client) => {
        const result = await client.query<AdminRow>(
          `UPDATE users
           SET password_hash=$1, updated_at=now()
           WHERE id=$2 AND role='ADMIN'
           RETURNING id, username, role, created_at`,
          [passwordHash, request.params.id],
        )
        const user = result.rows[0]
        if (!user) return 404
        await recordPasswordChange(client, {
          actor: request.session.user!,
          source: 'OWNER_RESET',
          target: user,
        })
        return 204
      })
      response.status(status).end()
    } catch (error) {
      next(error)
    }
  })

  router.get('/password-events', async (_request, response, next) => {
    try {
      const result = await db.query<PasswordChangeRow>(
        `SELECT id, actor_username, actor_role, target_username, target_role,
                subject_id, occurred_at
         FROM security_audit_events
         WHERE event_type = 'PASSWORD_CHANGED'
         ORDER BY occurred_at DESC
         LIMIT 100`,
      )
      response.json({
        events: result.rows.map((row) => ({
          id: row.id,
          actorUsername: row.actor_username,
          actorRole: row.actor_role,
          targetUsername: row.target_username,
          targetRole: row.target_role,
          source: row.subject_id,
          occurredAt: row.occurred_at.toISOString(),
        })),
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}
