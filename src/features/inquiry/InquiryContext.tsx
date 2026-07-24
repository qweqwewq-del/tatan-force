import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Customer, Inquiry, InquiryItem } from '../../models/inquiry'
import { submitInquiry as submitInquiryApi } from '../../services/inquiry-api'
import {
  clearInquiryCustomer,
  clearInquiryItems,
  readInquiryCustomer,
  readInquiryItems,
  saveInquiryCustomer,
  saveInquiryItems,
  saveInquiryRecord,
} from '../../services/inquiry-storage'

const testMode = import.meta.env.MODE === 'test'

interface InquiryContextValue {
  items: InquiryItem[]
  customer: Customer | null
  lastSubmittedInquiry: Inquiry | null
  addItem: (item: InquiryItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateNote: (productId: string, note: string) => void
  saveCustomer: (customer: Customer) => boolean
  submitInquiry: () => Promise<Inquiry | null>
  clearInquiry: () => void
  getTotalItems: () => number
}

const InquiryContext = createContext<InquiryContextValue | null>(null)

export function InquiryProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<InquiryItem[]>(
    testMode ? readInquiryItems : () => [],
  )
  const [customer, setCustomer] = useState<Customer | null>(
    testMode ? readInquiryCustomer : () => null,
  )
  const [lastSubmittedInquiry, setLastSubmittedInquiry] =
    useState<Inquiry | null>(null)

  useEffect(() => {
    if (testMode) saveInquiryItems(items)
  }, [items])

  const addItem = useCallback((item: InquiryItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) => currentItem.productId === item.productId,
      )

      if (!existingItem) {
        return [...currentItems, item]
      }

      return currentItems.map((currentItem) =>
        currentItem.productId === item.productId
          ? {
              ...currentItem,
              quantity: currentItem.quantity + item.quantity,
            }
          : currentItem,
      )
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) {
        return
      }

      setItems((currentItems) =>
        quantity <= 0
          ? currentItems.filter((item) => item.productId !== productId)
          : currentItems.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
      )
    },
    [],
  )

  const updateNote = useCallback((productId: string, note: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, note: note.trimStart().slice(0, 200) }
          : item,
      ),
    )
  }, [])

  const saveCustomer = useCallback((nextCustomer: Customer) => {
    if (testMode) saveInquiryCustomer(nextCustomer)
    setCustomer(nextCustomer)
    return true
  }, [])

  const submitInquiry = useCallback(async () => {
    if (!customer || items.length === 0) {
      return null
    }

    try {
      const inquiry = await submitInquiryApi(customer, items)
      if (testMode) {
        saveInquiryRecord(inquiry)
        clearInquiryItems()
        clearInquiryCustomer()
      }
      setLastSubmittedInquiry(inquiry)
      setItems([])
      setCustomer(null)
      return inquiry
    } catch {
      return null
    }
  }, [customer, items])

  const clearInquiry = useCallback(() => {
    if (testMode) clearInquiryItems()
    setItems([])
  }, [])

  const getTotalItems = useCallback(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      customer,
      lastSubmittedInquiry,
      addItem,
      removeItem,
      updateQuantity,
      updateNote,
      saveCustomer,
      submitInquiry,
      clearInquiry,
      getTotalItems,
    }),
    [
      addItem,
      clearInquiry,
      customer,
      getTotalItems,
      items,
      lastSubmittedInquiry,
      removeItem,
      saveCustomer,
      submitInquiry,
      updateNote,
      updateQuantity,
    ],
  )

  return (
    <InquiryContext.Provider value={value}>
      {children}
    </InquiryContext.Provider>
  )
}

// The hook is intentionally colocated with its provider as the feature's public API.
// eslint-disable-next-line react-refresh/only-export-components
export function useInquiry() {
  const context = useContext(InquiryContext)

  if (!context) {
    throw new Error('useInquiry must be used within InquiryProvider')
  }

  return context
}
