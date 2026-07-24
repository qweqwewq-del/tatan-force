import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { products } from '../../data/products.mock'
import { createInquiryRecord } from '../../features/inquiry/workflow'
import { saveInquiryRecord } from '../../services/inquiry-storage'
import { AdminInquiriesPage } from './AdminInquiriesPage'

describe('AdminInquiriesPage', () => {
  it('shows customer data and updates inquiry status', async () => {
    const user = userEvent.setup()
    const product = products[0]
    saveInquiryRecord(
      createInquiryRecord(
        {
          name: '采购测试客户',
          phone: '13800138000',
          company: '力量训练中心',
        },
        [
          {
            productId: product.id,
            slug: product.slug,
            sku: product.sku,
            productName: product.name,
            image: product.images[0],
            quantity: 1,
            unitPrice: product.price,
          },
        ],
        new Date('2026-07-24T00:00:00.000Z'),
      ),
    )

    render(<AdminInquiriesPage />)
    expect(await screen.findByText('采购测试客户')).toBeInTheDocument()
    const statusSelect = screen.getByRole('combobox', {
      name: '修改 采购测试客户 的询价状态',
    })
    await user.selectOptions(statusSelect, 'contacted')
    expect(screen.getByText('询价状态已更新为“已联系”。')).toBeInTheDocument()
  })
})
