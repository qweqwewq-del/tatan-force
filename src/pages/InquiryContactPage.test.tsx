import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { products } from '../data/products.mock'
import { InquiryProvider } from '../features/inquiry/InquiryContext'
import {
  readInquiryCustomer,
  saveInquiryItems,
} from '../services/inquiry-storage'
import { InquiryContactPage } from './InquiryContactPage'
import { QuotePreviewPage } from './QuotePreviewPage'

const product = products[1]

describe('InquiryContactPage', () => {
  beforeEach(() => {
    saveInquiryItems([
      {
        productId: product.id,
        slug: product.slug,
        sku: product.sku,
        productName: product.name,
        image: product.images[0],
        quantity: 1,
        unitPrice: product.price,
      },
    ])
  })

  it('validates required fields and saves a valid customer', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/inquiry/contact']}>
        <InquiryProvider>
          <Routes>
            <Route path="/inquiry/contact" element={<InquiryContactPage />} />
            <Route path="/inquiry/preview" element={<QuotePreviewPage />} />
          </Routes>
        </InquiryProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '保存并预览报价' }))
    expect(screen.getByText('请输入至少 2 个字符的姓名')).toBeInTheDocument()
    expect(screen.getByText('请输入有效的 11 位手机号码')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/姓名/), '李强')
    await user.type(screen.getByLabelText(/手机/), '13800138000')
    await user.click(screen.getByRole('button', { name: '保存并预览报价' }))

    await waitFor(
      () =>
        expect(
          screen.getByRole('heading', { level: 1, name: '报价预览' }),
        ).toBeInTheDocument(),
      { timeout: 1_500 },
    )
    expect(readInquiryCustomer()).toMatchObject({
      name: '李强',
      phone: '13800138000',
    })
  })
})
