import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useDocumentMeta } from '../../app/useDocumentMeta'
import { AccessLoginPanel } from '../../components/admin/AccessLoginPanel'
import { useAuth } from '../../features/admin/useAuth'

export function AdminLoginPage() {
  const [error, setError] = useState('')
  const { login, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const target =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/admin/products'

  useDocumentMeta(
    '商家后台登录｜TATAN FORCE',
    'TATAN FORCE 商家商品、询价与网站设置管理入口。',
  )

  if (session?.role === 'ADMIN') {
    return <Navigate replace to="/admin/products" />
  }

  return (
    <main className="access-page admin-access-page">
      <div className="access-page__brand">
        <strong>TATAN FORCE</strong>
        <span>INDUSTRIAL SALES CONTROL</span>
      </div>
      <AccessLoginPanel
        description="登录后管理商品目录、客户询价与网站联系信息。"
        error={error}
        eyebrow="AUTHORIZED MERCHANT ACCESS"
        role="ADMIN"
        title="商家后台登录"
        onSubmit={async (username, password) => {
          if (await login(username, password, 'ADMIN')) {
            navigate(target, { replace: true })
          } else {
            setError('用户名或密码错误。')
          }
        }}
      />
      <p className="access-page__notice">
        登录会话由服务端签发，并通过 HttpOnly Cookie 进行保护。
      </p>
    </main>
  )
}
