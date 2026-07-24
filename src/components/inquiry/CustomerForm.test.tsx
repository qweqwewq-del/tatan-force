import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CustomerForm } from './CustomerForm'

describe('CustomerForm', () => {
  it('blocks invalid details and submits valid customer data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<CustomerForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: '确认客户资料' }))
    expect(screen.getByText('请输入至少 2 个字符的姓名')).toBeInTheDocument()
    expect(screen.getByText('请输入有效的 11 位手机号码')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/姓名/), '陈力')
    await user.type(screen.getByLabelText(/手机/), '13800006271')
    await user.click(screen.getByRole('button', { name: '确认客户资料' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '陈力',
        phone: '13800006271',
      }),
    )
  })
})
