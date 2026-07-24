import { describe, expect, it } from 'vitest'
import { siteSettings } from '../../data/settings.mock'
import type { Customer, InquiryItem } from '../../models/inquiry'
import { createInquiryRecord, createQuote } from './workflow'

const customer: Customer = {
  name: '张力',
  phone: '13800138000',
  company: '泰坦健身中心',
}

const items: InquiryItem[] = [
  {
    productId: 'product-a',
    slug: 'product-a',
    sku: 'TF-A',
    productName: '测试训练架',
    image: '/product-a.png',
    quantity: 3,
    unitPrice: 12_345,
  },
  {
    productId: 'product-b',
    slug: 'product-b',
    sku: 'TF-B',
    productName: '测试杠铃片',
    image: '/product-b.png',
    quantity: 2,
    unitPrice: 9_999,
  },
]

describe('inquiry workflow', () => {
  it('creates a quote with safe integer-cent line amounts and total', () => {
    const quote = createQuote(
      customer,
      items,
      siteSettings,
      new Date('2026-07-23T08:00:00.000Z'),
    )

    expect(quote.items[0].amount).toBe(37_035)
    expect(quote.items[1].amount).toBe(19_998)
    expect(quote.subtotal).toBe(57_033)
    expect(quote.total).toBe(57_033)
    expect(quote.quoteNo).toMatch(/^TFQ-20260723-/)
  })

  it('creates a pending inquiry record with copied customer and items', () => {
    const inquiry = createInquiryRecord(
      customer,
      items,
      new Date('2026-07-23T08:00:00.000Z'),
    )

    expect(inquiry.id).toMatch(/^TFI-20260723-/)
    expect(inquiry.status).toBe('pending')
    expect(inquiry.customer).toEqual(customer)
    expect(inquiry.items).toEqual(items)
  })
})
