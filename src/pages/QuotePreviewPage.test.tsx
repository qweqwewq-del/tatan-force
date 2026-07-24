import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { products } from '../data/products.mock'
import { InquiryProvider } from '../features/inquiry/InquiryContext'
import {
  readInquiryItems,
  readInquiryRecords,
  saveInquiryCustomer,
  saveInquiryItems,
} from '../services/inquiry-storage'
import { InquirySuccessPage } from './InquirySuccessPage'
import { QuotePreviewPage } from './QuotePreviewPage'

const product = products[0]

describe('QuotePreviewPage', () => {
  beforeEach(() => {
    saveInquiryItems([
      {
        productId: product.id,
        slug: product.slug,
        sku: product.sku,
        productName: product.name,
        image: product.images[0],
        quantity: 2,
        unitPrice: product.price,
        specification: '20kg / 红色',
      },
    ])
    saveInquiryCustomer({
      name: '王敏',
      phone: '13900139000',
      company: '力量空间',
    })
  })

  it('renders correct line and total amounts and submits an inquiry record', async () => {
    render(
      <MemoryRouter initialEntries={['/inquiry/preview']}>
        <InquiryProvider>
          <Routes>
            <Route path="/inquiry/preview" element={<QuotePreviewPage />} />
            <Route path="/inquiry/success" element={<InquirySuccessPage />} />
          </Routes>
        </InquiryProvider>
      </MemoryRouter>,
    )

    expect(screen.getAllByText('¥17200.00').length).toBeGreaterThanOrEqual(2)
    fireEvent.click(screen.getByRole('button', { name: '确认并提交询价' }))

    await waitFor(
      () =>
        expect(
          screen.getByRole('heading', { level: 1, name: '询价提交成功' }),
        ).toBeInTheDocument(),
      { timeout: 1_500 },
    )

    expect(readInquiryRecords()).toHaveLength(1)
    expect(readInquiryRecords()[0].status).toBe('pending')
    expect(readInquiryItems()).toEqual([])
  })
})
