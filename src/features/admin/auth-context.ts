import { createContext } from 'react'
import type { AdminRole, AuthSession } from '../../models/admin'

export interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  login: (
    username: string,
    password: string,
    role: AdminRole,
  ) => Promise<boolean>
  logout: () => Promise<void>
  changePassword: (
    currentPassword: string,
    nextPassword: string,
  ) => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
