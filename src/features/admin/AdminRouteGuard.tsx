import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../../components/common/LoadingState'
import { useAuth } from './useAuth'

export function AdminRouteGuard() {
  const { loading, session } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState label="正在验证安全会话" />
  }

  if (!session || session.role !== 'ADMIN') {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to="/admin/login"
      />
    )
  }

  return <Outlet />
}
