import type { Product } from '../models/product'
import { apiRequest } from './api-client'

export async function fetchProducts(admin = false): Promise<Product[]> {
  const response = await apiRequest<{ products: Product[] }>(
    `/products${admin ? '?scope=admin' : ''}`,
  )
  return response.products
}

export async function fetchProduct(slug: string): Promise<Product> {
  const response = await apiRequest<{ product: Product }>(
    `/products/${encodeURIComponent(slug)}`,
  )
  return response.product
}

export async function saveProduct(product: Product): Promise<Product> {
  const response = await apiRequest<{ product: Product }>(
    `/products/${encodeURIComponent(product.id)}`,
    { method: 'PUT', body: JSON.stringify(product) },
  )
  return response.product
}

export async function createProduct(product: Product): Promise<Product> {
  const response = await apiRequest<{ product: Product }>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
  return response.product
}

export function removeProduct(productId: string): Promise<void> {
  return apiRequest(`/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  })
}
