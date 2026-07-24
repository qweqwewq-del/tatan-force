import { beforeEach, describe, expect, it } from 'vitest'
import type { InquiryItem } from '../models/inquiry'
import {
  clearInquiryItems,
  INQUIRY_STORAGE_KEY,
  readInquiryCustomer,
  readInquiryItems,
  readInquiryRecords,
  removeInquiryItem,
  saveInquiryCustomer,
  saveInquiryItems,
  saveInquiryRecord,
  updateInquiryItem,
} from './inquiry-storage'

const item: InquiryItem = {
  productId: 'product-1',
  slug: 'product-1',
  sku: 'TF-001',
  productName: '测试产品',
  image: '/test.svg',
  quantity: 1,
  unitPrice: 100_00,
}

describe('inquiry storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and reads a typed inquiry list', () => {
    expect(saveInquiryItems([item])).toBe(true)
    expect(readInquiryItems()).toEqual([item])
  })

  it('updates, removes and clears items', () => {
    saveInquiryItems([item])
    expect(updateInquiryItem(item.productId, 3)[0].quantity).toBe(3)
    expect(removeInquiryItem(item.productId)).toEqual([])

    saveInquiryItems([item])
    expect(clearInquiryItems()).toBe(true)
    expect(localStorage.getItem(INQUIRY_STORAGE_KEY)).toBeNull()
  })

  it('returns an empty list for malformed storage data', () => {
    localStorage.setItem(INQUIRY_STORAGE_KEY, '{"version":1,"items":[{}]}')
    expect(readInquiryItems()).toEqual([])
  })

  it('persists customer details and completed inquiry records', () => {
    const customer = { name: '赵刚', phone: '13700137000' }
    const inquiry = {
      id: 'TFI-20260723-000001',
      customer,
      items: [item],
      status: 'pending' as const,
      submittedAt: '2026-07-23T08:00:00.000Z',
    }

    expect(saveInquiryCustomer(customer)).toBe(true)
    expect(readInquiryCustomer()).toEqual(customer)
    expect(saveInquiryRecord(inquiry)).toBe(true)
    expect(readInquiryRecords()).toEqual([inquiry])
  })
})
