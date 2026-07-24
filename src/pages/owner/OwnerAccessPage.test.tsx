import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../features/admin/AuthContext'
import { OwnerAccessPage } from './OwnerAccessPage'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('OwnerAccessPage', () => {
  it('opens the standalone owner console only with deployment credentials', async () => {
    vi.stubEnv('VITE_OWNER_PASSWORD', 'owner-secret')
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthProvider>
          <OwnerAccessPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('维护身份验证')).toBeInTheDocument()
    await user.type(screen.getByLabelText('用户名'), 'tatan_master')
    await user.type(screen.getByLabelText('密码'), 'owner-secret')
    await user.click(screen.getByRole('button', { name: '验证身份' }))

    expect(await screen.findByText('系统维护控制台')).toBeInTheDocument()
    expect(screen.getByText('商家管理员账号')).toBeInTheDocument()
  })
})
