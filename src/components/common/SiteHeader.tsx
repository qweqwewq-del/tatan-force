import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useInquiry } from '../../features/inquiry/InquiryContext'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { getTotalItems } = useInquiry()
  const totalItems = getTotalItems()

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink
          className="brand-mark"
          to="/"
          aria-label="TATAN FORCE 首页"
          onClick={() => setMenuOpen(false)}
        >
          <span>TATAN FORCE</span>
          <small>泰坦引擎体育</small>
        </NavLink>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
          className="site-menu-toggle"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
        </button>
        <nav
          className={`site-nav ${menuOpen ? 'site-nav--open' : ''}`}
          aria-label="主导航"
        >
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            首页
          </NavLink>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}>
            产品中心
          </NavLink>
          <NavLink
            className="site-nav__inquiry"
            to="/inquiry"
            onClick={() => setMenuOpen(false)}
          >
            询价清单
            <span aria-label={`${totalItems} 件产品`}>{totalItems}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
