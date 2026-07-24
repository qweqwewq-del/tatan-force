import type { Customer } from './inquiry'

export interface Contact {
  name: string
  phone: string
  wechat?: string
  email?: string
  qrCodeUrl?: string
}

export interface QuoteItem {
  productId: string
  sku: string
  productName: string
  specification?: string
  quantity: number
  /**
   * All monetary fields use integer cents.
   */
  unitPrice: number
  amount: number
}

export interface QuoteFee {
  id: string
  label: string
  amount: number
}

export interface Quote {
  quoteNo: string
  customer: Customer
  items: QuoteItem[]
  subtotal: number
  extraFees: QuoteFee[]
  total: number
  quoteDate: string
  validUntil?: string
  salesContact: Contact
  remarks: string[]
}
