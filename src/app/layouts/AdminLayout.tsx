import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/admin/useAuth'

const adminNavigation = [
  ['/admin/products', '商品管理', 'CATALOG'],
  ['/admin/inquiries', '询价管理', 'INQUIRY'],
  ['/admin/settings', '网站设置', 'SETTINGS'],
  ['/admin/account', '账号安全', 'ACCOUNT'],
] as const

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout, session } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <strong>TATAN FORCE</strong>
          <span>商家管理控制台</span>
        </div>
        <nav aria-label="后台导航">
          {adminNavigation.map(([to, label, code], index) => (
            <NavLink
              key={to}
              onClick={() => setMenuOpen(false)}
              to={to}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{label}</strong>
              <small>{code}</small>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__session">
          <span>当前账号</span>
          <strong>{session?.username}</strong>
          <button onClick={handleLogout} type="button">退出登录</button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            aria-expanded={menuOpen}
            className="admin-menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            后台目录
          </button>
          <div>
            <span>ROLE</span>
            <strong>ADMIN / 商家管理员</strong>
          </div>
          <p>SECURE API CHANNEL</p>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
