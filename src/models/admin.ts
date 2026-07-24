export type AdminRole = 'OWNER' | 'ADMIN'

export interface AdminUser {
  id: string
  username: string
  passwordHash: string
  role: AdminRole
  createdAt: string
}

export interface AuthSession {
  userId: string
  username: string
  role: AdminRole
  issuedAt: string
}

export interface SystemConfig {
  maintenanceMode: boolean
  environmentLabel: string
  apiBaseUrl: string
  updatedAt: string
}
