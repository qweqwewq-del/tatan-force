import type { Customer, Inquiry, InquiryItem } from '../models/inquiry'

export const INQUIRY_STORAGE_KEY = 'tatan-force-inquiry'
export const INQUIRY_CUSTOMER_STORAGE_KEY = 'tatan-force-inquiry-customer'
export const INQUIRY_RECORDS_STORAGE_KEY = 'tatan-force-inquiry-records'
export const LAST_INQUIRY_ID_STORAGE_KEY = 'tatan-force-last-inquiry-id'
const STORAGE_VERSION = 1

interface StoredInquiry {
  version: typeof STORAGE_VERSION
  items: InquiryItem[]
}

interface StoredCustomer {
  version: typeof STORAGE_VERSION
  customer: Customer
}

interface StoredInquiryRecords {
  version: typeof STORAGE_VERSION
  records: Inquiry[]
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isInquiryItem(value: unknown): value is InquiryItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.productId === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.sku === 'string' &&
    typeof value.productName === 'string' &&
    typeof value.image === 'string' &&
    Number.isSafeInteger(value.quantity) &&
    Number(value.quantity) > 0 &&
    Number.isSafeInteger(value.unitPrice) &&
    Number(value.unitPrice) >= 0 &&
    (value.specification === undefined ||
      typeof value.specification === 'string') &&
    (value.note === undefined || typeof value.note === 'string')
  )
}

function hasOptionalString(
  value: Record<string, unknown>,
  key: string,
): boolean {
  return value[key] === undefined || typeof value[key] === 'string'
}

function isCustomer(value: unknown): value is Customer {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.name === 'string' &&
    typeof value.phone === 'string' &&
    hasOptionalString(value, 'wechat') &&
    hasOptionalString(value, 'company') &&
    hasOptionalString(value, 'address') &&
    hasOptionalString(value, 'email') &&
    hasOptionalString(value, 'note')
  )
}

function isInquiry(value: unknown): value is Inquiry {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    isCustomer(value.customer) &&
    Array.isArray(value.items) &&
    value.items.every(isInquiryItem) &&
    ['pending', 'contacted', 'won', 'closed'].includes(String(value.status)) &&
    typeof value.submittedAt === 'string' &&
    hasOptionalString(value, 'internalNote')
  )
}

function isStoredInquiry(value: unknown): value is StoredInquiry {
  return (
    isRecord(value) &&
    value.version === STORAGE_VERSION &&
    Array.isArray(value.items) &&
    value.items.every(isInquiryItem)
  )
}

export function readInquiryItems(): InquiryItem[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const rawValue = storage.getItem(INQUIRY_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsed: unknown = JSON.parse(rawValue)
    return isStoredInquiry(parsed) ? parsed.items : []
  } catch {
    return []
  }
}

export function saveInquiryItems(items: readonly InquiryItem[]): boolean {
  const storage = getStorage()

  if (!storage || !items.every(isInquiryItem)) {
    return false
  }

  const payload: StoredInquiry = {
    version: STORAGE_VERSION,
    items: [...items],
  }

  try {
    storage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

export function updateInquiryItem(
  productId: string,
  quantity: number,
): InquiryItem[] {
  const items = readInquiryItems()
  const updatedItems =
    quantity <= 0
      ? items.filter((item) => item.productId !== productId)
      : items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        )

  saveInquiryItems(updatedItems)
  return updatedItems
}

export function updateInquiryItemNote(
  productId: string,
  note: string,
): InquiryItem[] {
  const updatedItems = readInquiryItems().map((item) =>
    item.productId === productId
      ? { ...item, note: note.trimStart().slice(0, 200) }
      : item,
  )
  saveInquiryItems(updatedItems)
  return updatedItems
}

export function removeInquiryItem(productId: string): InquiryItem[] {
  const updatedItems = readInquiryItems().filter(
    (item) => item.productId !== productId,
  )
  saveInquiryItems(updatedItems)
  return updatedItems
}

export function clearInquiryItems(): boolean {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(INQUIRY_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function readInquiryCustomer(): Customer | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  try {
    const rawValue = storage.getItem(INQUIRY_CUSTOMER_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsed: unknown = JSON.parse(rawValue)
    return (
      isRecord(parsed) &&
      parsed.version === STORAGE_VERSION &&
      isCustomer(parsed.customer)
    )
      ? parsed.customer
      : null
  } catch {
    return null
  }
}

export function saveInquiryCustomer(customer: Customer): boolean {
  const storage = getStorage()

  if (!storage || !isCustomer(customer)) {
    return false
  }

  const payload: StoredCustomer = {
    version: STORAGE_VERSION,
    customer,
  }

  try {
    storage.setItem(INQUIRY_CUSTOMER_STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

export function clearInquiryCustomer(): boolean {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(INQUIRY_CUSTOMER_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function readInquiryRecords(): Inquiry[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const rawValue = storage.getItem(INQUIRY_RECORDS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsed: unknown = JSON.parse(rawValue)
    return (
      isRecord(parsed) &&
      parsed.version === STORAGE_VERSION &&
      Array.isArray(parsed.records) &&
      parsed.records.every(isInquiry)
    )
      ? parsed.records
      : []
  } catch {
    return []
  }
}

export function saveInquiryRecord(inquiry: Inquiry): boolean {
  const storage = getStorage()

  if (!storage || !isInquiry(inquiry)) {
    return false
  }

  const records = readInquiryRecords()
  const payload: StoredInquiryRecords = {
    version: STORAGE_VERSION,
    records: [inquiry, ...records.filter((record) => record.id !== inquiry.id)],
  }

  try {
    storage.setItem(INQUIRY_RECORDS_STORAGE_KEY, JSON.stringify(payload))
    storage.setItem(LAST_INQUIRY_ID_STORAGE_KEY, inquiry.id)
    return true
  } catch {
    return false
  }
}

export function readInquiryRecord(id: string): Inquiry | null {
  return readInquiryRecords().find((record) => record.id === id) ?? null
}

export function readLastInquiryId(): string | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  try {
    return storage.getItem(LAST_INQUIRY_ID_STORAGE_KEY)
  } catch {
    return null
  }
}

export function updateInquiryStatus(
  inquiryId: string,
  status: Inquiry['status'],
): Inquiry[] {
  const records = readInquiryRecords().map((record) =>
    record.id === inquiryId ? { ...record, status } : record,
  )
  const storage = getStorage()

  if (!storage) {
    return records
  }

  try {
    storage.setItem(
      INQUIRY_RECORDS_STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        records,
      } satisfies StoredInquiryRecords),
    )
  } catch {
    return readInquiryRecords()
  }

  return records
}
