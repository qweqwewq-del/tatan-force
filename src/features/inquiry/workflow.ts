import type { SiteSettings } from '../../data/settings.mock'
import type { Customer, Inquiry, InquiryItem } from '../../models/inquiry'
import type { Quote, QuoteItem } from '../../models/quote'
import { calculateSubtotal } from './money'

function compactDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '')
}

function displayDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function createDocumentNumber(prefix: 'TFI' | 'TFQ', date: Date) {
  const suffix = String(date.getTime()).slice(-6).padStart(6, '0')
  return `${prefix}-${compactDate(date)}-${suffix}`
}

export function createInquiryRecord(
  customer: Customer,
  items: readonly InquiryItem[],
  submittedAt = new Date(),
): Inquiry {
  return {
    id: createDocumentNumber('TFI', submittedAt),
    customer: { ...customer },
    items: items.map((item) => ({ ...item })),
    status: 'pending',
    submittedAt: submittedAt.toISOString(),
  }
}

export function createQuote(
  customer: Customer,
  items: readonly InquiryItem[],
  settings: SiteSettings,
  quoteDate = new Date(),
): Quote {
  const quoteItems: QuoteItem[] = items.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    productName: item.productName,
    specification: item.specification,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: calculateSubtotal([item]),
  }))
  const subtotal = calculateSubtotal(quoteItems)
  const validUntil = new Date(quoteDate)
  validUntil.setDate(validUntil.getDate() + settings.quoteValidityDays)

  return {
    quoteNo: createDocumentNumber('TFQ', quoteDate),
    customer: { ...customer },
    items: quoteItems,
    subtotal,
    extraFees: [],
    total: subtotal,
    quoteDate: displayDate(quoteDate),
    validUntil: displayDate(validUntil),
    salesContact: {
      name: `${settings.brandName} 销售顾问`,
      phone: settings.phone,
      wechat: settings.wechat,
      email: settings.email,
      qrCodeUrl: settings.qrCodeUrl,
    },
    remarks: [settings.defaultSalesNote],
  }
}
