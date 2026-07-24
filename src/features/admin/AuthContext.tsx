import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthSession } from '../../models/admin'
import {
  changePassword as changePasswordApi,
  fetchSession,
  login as loginApi,
  logout as logoutApi,
} from '../../services/auth-api'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchSession()
      .then((nextSession) => {
        if (active) setSession(nextSession)
      })
      .catch(() => {
        if (active) setSession(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      async login(username, password, role) {
        try {
          const nextSession = await loginApi(username, password, role)
          setSession(nextSession)
          return true
        } catch {
          setSession(null)
          return false
        }
      },
      async logout() {
        try {
          await logoutApi()
        } finally {
          setSession(null)
        }
      },
      async changePassword(currentPassword, nextPassword) {
        if (!session) {
          return false
        }
        try {
          await changePasswordApi(currentPassword, nextPassword)
          return true
        } catch {
          return false
        }
      },
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
