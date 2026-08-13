import type { AdminUser } from '../models/admin'
import { apiRequest } from './api-client'

export type ManagedAdminUser = Omit<AdminUser, 'passwordHash'>

export type PasswordChangeSource =
  | 'SELF_SERVICE'
  | 'OWNER_RESET'
  | 'DEPLOYMENT_RESET'

export interface PasswordChangeEvent {
  id: string
  actorUsername: string
  actorRole: string
  targetUsername: string
  targetRole: 'ADMIN' | 'OWNER'
  source: PasswordChangeSource
  occurredAt: string
}

export async function fetchAdminUsers(): Promise<ManagedAdminUser[]> {
  const response = await apiRequest<{ users: ManagedAdminUser[] }>('/owner/users')
  return response.users
}

export function resetAdminPassword(id: string, password: string): Promise<void> {
  return apiRequest(`/owner/users/${encodeURIComponent(id)}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  })
}

export async function fetchPasswordChangeEvents(): Promise<PasswordChangeEvent[]> {
  const response = await apiRequest<{ events: PasswordChangeEvent[] }>(
    '/owner/password-events',
  )
  return response.events
}
