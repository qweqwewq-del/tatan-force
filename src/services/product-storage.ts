import { products as seedProducts } from '../data/products.mock'
import type { Product } from '../models/product'

export const PRODUCTS_STORAGE_KEY = 'tatan-force-products'
const STORAGE_VERSION = 1

interface StoredProducts {
  version: typeof STORAGE_VERSION
  products: Product[]
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function cloneProducts(products: readonly Product[]) {
  return products.map((product) => ({
    ...product,
    images: [...product.images],
    specifications: product.specifications.map((specification) => ({
      ...specification,
    })),
    features: [...product.features],
    useCases: [...product.useCases],
  }))
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const product = value as Record<string, unknown>
  return (
    typeof product.id === 'string' &&
    typeof product.slug === 'string' &&
    typeof product.sku === 'string' &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    Array.isArray(product.images) &&
    product.images.every((image) => typeof image === 'string') &&
    Number.isSafeInteger(product.price) &&
    (product.status === 'active' || product.status === 'draft')
  )
}

export function readProducts(): Product[] {
  const storage = getStorage()

  if (!storage) {
    return cloneProducts(seedProducts)
  }

  try {
    const raw = storage.getItem(PRODUCTS_STORAGE_KEY)

    if (!raw) {
      return cloneProducts(seedProducts)
    }

    const parsed: unknown = JSON.parse(raw)
    const record =
      typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null

    return record?.version === STORAGE_VERSION &&
      Array.isArray(record.products) &&
      record.products.every(isProduct)
      ? cloneProducts(record.products)
      : cloneProducts(seedProducts)
  } catch {
    return cloneProducts(seedProducts)
  }
}

export function readPublicProducts() {
  return readProducts().filter((product) => product.status === 'active')
}

export function findProductBySlug(slug: string) {
  return readPublicProducts().find((product) => product.slug === slug)
}

export function saveProducts(products: readonly Product[]): boolean {
  const storage = getStorage()

  if (!storage || !products.every(isProduct)) {
    return false
  }

  try {
    storage.setItem(
      PRODUCTS_STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        products: cloneProducts(products),
      } satisfies StoredProducts),
    )
    return true
  } catch {
    return false
  }
}

export function upsertProduct(product: Product): Product[] {
  const products = readProducts()
  const exists = products.some((candidate) => candidate.id === product.id)
  const nextProducts = exists
    ? products.map((candidate) =>
        candidate.id === product.id ? product : candidate,
      )
    : [product, ...products]
  saveProducts(nextProducts)
  return nextProducts
}

export function deleteProduct(productId: string): Product[] {
  const nextProducts = readProducts().filter(
    (product) => product.id !== productId,
  )
  saveProducts(nextProducts)
  return nextProducts
}

export function setProductStatus(
  productId: string,
  status: Product['status'],
): Product[] {
  const nextProducts = readProducts().map((product) =>
    product.id === productId ? { ...product, status } : product,
  )
  saveProducts(nextProducts)
  return nextProducts
}
