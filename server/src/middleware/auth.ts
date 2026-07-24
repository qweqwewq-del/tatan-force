import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../types.js'

export function requireAuth(allowedRoles: readonly Role[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    const user = request.session.user
    if (!user) {
      response.status(401).json({ error: 'UNAUTHENTICATED' })
      return
    }
    if (!allowedRoles.includes(user.role)) {
      response.status(403).json({ error: 'FORBIDDEN' })
      return
    }
    next()
  }
}

export function requireSameOrigin(appOrigin: string) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      next()
      return
    }
    const origin = request.get('origin')
    if (origin && origin !== appOrigin) {
      response.status(403).json({ error: 'ORIGIN_NOT_ALLOWED' })
      return
    }
    next()
  }
}
