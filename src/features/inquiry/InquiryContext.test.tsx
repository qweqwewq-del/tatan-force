import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { PropsWithChildren } from 'react'
import type { InquiryItem } from '../../models/inquiry'
import { InquiryProvider, useInquiry } from './InquiryContext'

const item: InquiryItem = {
  productId: 'product-1',
  slug: 'product-1',
  sku: 'TF-001',
  productName: '测试产品',
  image: '/test.svg',
  quantity: 1,
  unitPrice: 100_00,
}

function wrapper({ children }: PropsWithChildren) {
  return <InquiryProvider>{children}</InquiryProvider>
}

describe('InquiryContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds an item and updates its quantity', () => {
    const { result } = renderHook(useInquiry, { wrapper })

    act(() => result.current.addItem(item))
    expect(result.current.items[0].quantity).toBe(1)

    act(() => result.current.updateQuantity(item.productId, 4))
    expect(result.current.items[0].quantity).toBe(4)
    expect(result.current.getTotalItems()).toBe(4)

    act(() => result.current.updateQuantity(item.productId, 0))
    expect(result.current.items).toEqual([])
  })
})
