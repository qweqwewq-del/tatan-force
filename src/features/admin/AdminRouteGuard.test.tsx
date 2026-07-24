import { render, screen } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthContext'
import { AdminRouteGuard } from './AdminRouteGuard'

function renderGuardedRoute() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin/products']}>
        <Routes>
          <Route path="/admin/login" element={<p>登录页面</p>} />
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin/products" element={<p>商品后台</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('AdminRouteGuard', () => {
  it('redirects unauthenticated visitors to the admin login', async () => {
    renderGuardedRoute()
    expect(await screen.findByText('登录页面')).toBeInTheDocument()
  })
})
