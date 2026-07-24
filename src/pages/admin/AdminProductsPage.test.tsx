import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AdminProductsPage } from './AdminProductsPage'
import { readProducts } from '../../services/product-storage'

describe('AdminProductsPage', () => {
  it('renders products and persists an on/off shelf change', async () => {
    const user = userEvent.setup()
    render(<AdminProductsPage />)

    expect(screen.getByText('商品管理')).toBeInTheDocument()
    const statusButtons = screen.getAllByRole('button', { name: '已上架' })
    await user.click(statusButtons[0])

    expect(readProducts()[0].status).toBe('draft')
    expect(screen.getByText('产品已下架。')).toBeInTheDocument()
  })
})
