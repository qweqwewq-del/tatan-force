import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { products } from '../data/products.mock'
import { siteSettings } from '../data/settings.mock'
import {
  readInquiryRecords,
  updateInquiryStatus,
} from '../services/inquiry-storage'
import {
  deleteProduct,
  readProducts,
  upsertProduct,
} from '../services/product-storage'

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost')
    const method = init?.method ?? 'GET'
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : null

    if (url.pathname === '/api/auth/session') return json({ user: null })
    if (url.pathname === '/api/auth/login' && method === 'POST') {
      const validOwner =
        body.role === 'OWNER' &&
        body.username === 'tatan_master' &&
        body.password === 'owner-secret'
      const validAdmin =
        body.role === 'ADMIN' &&
        body.username === 'tatan_admin' &&
        body.password === 'TatanAdmin!2026'
      if (!validOwner && !validAdmin) return json({ error: 'INVALID_CREDENTIALS' }, 401)
      return json({
        user: {
          id: validOwner ? 'owner-1' : 'admin-1',
          username: body.username,
          role: body.role,
        },
        issuedAt: '2026-07-24T00:00:00.000Z',
      })
    }
    if (url.pathname === '/api/auth/logout') return new Response(null, { status: 204 })
    if (url.pathname === '/api/auth/change-password') return new Response(null, { status: 204 })

    if (url.pathname === '/api/products' && method === 'GET') {
      return json({ products: url.searchParams.get('scope') === 'admin' ? readProducts() : readProducts().filter((product) => product.status === 'active') })
    }
    if (url.pathname === '/api/products' && method === 'POST') {
      upsertProduct(body)
      return json({ product: body }, 201)
    }
    if (url.pathname.startsWith('/api/products/') && method === 'PUT') {
      upsertProduct(body)
      return json({ product: body })
    }
    if (url.pathname.startsWith('/api/products/') && method === 'DELETE') {
      deleteProduct(decodeURIComponent(url.pathname.split('/').at(-1) ?? ''))
      return new Response(null, { status: 204 })
    }
    if (url.pathname.startsWith('/api/products/')) {
      const slug = decodeURIComponent(url.pathname.split('/').at(-1) ?? '')
      const product = products.find((item) => item.slug === slug)
      return product ? json({ product }) : json({ error: 'PRODUCT_NOT_FOUND' }, 404)
    }

    if (url.pathname === '/api/inquiries/admin') {
      return json({ inquiries: readInquiryRecords() })
    }
    if (url.pathname.startsWith('/api/inquiries/admin/') && method === 'PUT') {
      const id = decodeURIComponent(url.pathname.split('/')[4] ?? '')
      updateInquiryStatus(id, body.status)
      return json({ id, status: body.status })
    }
    if (url.pathname === '/api/inquiries' && method === 'POST') {
      const product = products.find((item) => item.id === body.items[0]?.productId)!
      return json({
        inquiry: {
          id: 'TFI-20260724-000001',
          customer: body.customer,
          items: body.items.map((item: { productId: string; quantity: number; specification?: string; note?: string }) => ({
            productId: item.productId,
            slug: product.slug,
            sku: product.sku,
            productName: product.name,
            image: product.images[0],
            quantity: item.quantity,
            unitPrice: product.price,
            ...(item.specification ? { specification: item.specification } : {}),
            ...(item.note ? { note: item.note } : {}),
          })),
          status: 'pending',
          submittedAt: '2026-07-24T00:00:00.000Z',
        },
      }, 201)
    }

    if (url.pathname === '/api/settings' && method === 'GET') return json({ settings: siteSettings })
    if (url.pathname === '/api/settings' && method === 'PUT') return json({ settings: body })
    if (url.pathname === '/api/settings/system' && method === 'GET') {
      return json({ config: { maintenanceMode: false, environmentLabel: 'TEST', apiBaseUrl: '/api', updatedAt: '2026-07-24T00:00:00.000Z' } })
    }
    if (url.pathname === '/api/owner/users') {
      return json({ users: [{ id: 'admin-1', username: 'tatan_admin', role: 'ADMIN', createdAt: '2026-07-24T00:00:00.000Z' }] })
    }

    return json({ error: 'NOT_FOUND' }, 404)
  }))
})

afterEach(() => {
  cleanup()
  if (typeof localStorage !== 'undefined') localStorage.clear()
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
  vi.unstubAllGlobals()
})
