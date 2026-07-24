import type { AdminRole, AuthSession } from '../models/admin'
import { apiRequest } from './api-client'

interface SessionResponse {
  user: Omit<AuthSession, 'issuedAt'> | null
  issuedAt?: string
}

function toSession(response: SessionResponse): AuthSession | null {
  return response.user
    ? {
        ...response.user,
        issuedAt: response.issuedAt ?? new Date().toISOString(),
      }
    : null
}

export async function fetchSession(): Promise<AuthSession | null> {
  return toSession(await apiRequest<SessionResponse>('/auth/session'))
}

export async function login(
  username: string,
  password: string,
  role: AdminRole,
): Promise<AuthSession> {
  return toSession(await apiRequest<SessionResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  }))!
}

export function logout(): Promise<void> {
  return apiRequest('/auth/logout', { method: 'POST' })
}

export function changePassword(
  currentPassword: string,
  nextPassword: string,
): Promise<void> {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, nextPassword }),
  })
}
