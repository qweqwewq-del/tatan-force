export interface Customer {
  name: string
  phone: string
  wechat?: string
  company?: string
  address?: string
  email?: string
  note?: string
}

export interface InquiryItem {
  productId: string
  slug: string
  sku: string
  productName: string
  image: string
  specification?: string
  quantity: number
  /**
   * Unit price in integer cents.
   */
  unitPrice: number
  note?: string
}

export type InquiryStatus = 'pending' | 'contacted' | 'won' | 'closed'

export interface Inquiry {
  id: string
  customer: Customer
  items: InquiryItem[]
  status: InquiryStatus
  submittedAt: string
  internalNote?: string
}
