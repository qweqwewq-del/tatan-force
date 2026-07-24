import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { hashPassword } from '../security/password.js'
import type { Database } from '../types.js'

interface AdminRow {
  id: string
  username: string
  role: 'ADMIN'
  created_at: Date
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
      const result = await db.query(
        "UPDATE users SET password_hash=$1, updated_at=now() WHERE id=$2 AND role='ADMIN'",
        [passwordHash, request.params.id],
      )
      response.status(result.rowCount ? 204 : 404).end()
    } catch (error) {
      next(error)
    }
  })

  return router
}
