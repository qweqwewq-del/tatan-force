import { randomInt } from 'node:crypto'
import { Router } from 'express'
import type { PoolClient } from 'pg'
import {
  inquiryCreateSchema,
  inquiryStatusSchema,
  mapProduct,
  productSelectSql,
  type ProductRow,
} from '../domain.js'
import { requireAuth } from '../middleware/auth.js'
import type { Database } from '../types.js'

interface InquiryRow {
  id: string
  customer_name: string
  customer_phone: string
  customer_wechat: string | null
  customer_company: string | null
  customer_address: string | null
  customer_email: string | null
  customer_note: string | null
  status: 'pending' | 'contacted' | 'won' | 'closed'
  submitted_at: Date
  internal_note: string | null
  items: Array<{
    productId: string | null
    slug: string
    sku: string
    productName: string
    image: string
    specification?: string
    quantity: number
    unitPrice: number
    note?: string
  }>
}

function mapInquiry(row: InquiryRow) {
  return {
    id: row.id,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      ...(row.customer_wechat ? { wechat: row.customer_wechat } : {}),
      ...(row.customer_company ? { company: row.customer_company } : {}),
      ...(row.customer_address ? { address: row.customer_address } : {}),
      ...(row.customer_email ? { email: row.customer_email } : {}),
      ...(row.customer_note ? { note: row.customer_note } : {}),
    },
    items: row.items,
    status: row.status,
    submittedAt: row.submitted_at.toISOString(),
    ...(row.internal_note ? { internalNote: row.internal_note } : {}),
  }
}

const inquirySelectSql = `
  SELECT i.*,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'productId', ii.product_id,
          'slug', ii.slug,
          'sku', ii.sku,
          'productName', ii.product_name,
          'image', ii.image_url,
          'specification', ii.specification,
          'quantity', ii.quantity,
          'unitPrice', ii.unit_price,
          'note', ii.note
        ) ORDER BY ii.id
      ) FILTER (WHERE ii.id IS NOT NULL),
      '[]'::jsonb
    ) AS items
  FROM inquiries i
  LEFT JOIN inquiry_items ii ON ii.inquiry_id = i.id
`

function createInquiryId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `TFI-${date}-${String(randomInt(0, 1_000_000)).padStart(6, '0')}`
}

async function readProduct(client: PoolClient, id: string) {
  const result = await client.query<ProductRow>(
    `${productSelectSql} WHERE p.id = $1 AND p.status = 'active' GROUP BY p.id LIMIT 1`,
    [id],
  )
  return result.rows[0] ? mapProduct(result.rows[0]) : null
}

export function createInquiriesRouter(db: Database) {
  const router = Router()

  router.post('/', async (request, response, next) => {
    try {
      const input = inquiryCreateSchema.parse(request.body)
      const inquiry = await db.transaction(async (client) => {
        const id = createInquiryId()
        const products = new Map<string, Awaited<ReturnType<typeof readProduct>>>()
        for (const item of input.items) {
          if (!products.has(item.productId)) {
            products.set(item.productId, await readProduct(client, item.productId))
          }
        }
        if ([...products.values()].some((product) => !product)) {
          const error = new Error('One or more products are unavailable.')
          Object.assign(error, { statusCode: 400, code: 'PRODUCT_UNAVAILABLE' })
          throw error
        }

        await client.query(
          `INSERT INTO inquiries (
            id, customer_name, customer_phone, customer_wechat, customer_company,
            customer_address, customer_email, customer_note, status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')`,
          [
            id, input.customer.name, input.customer.phone,
            input.customer.wechat || null, input.customer.company || null,
            input.customer.address || null, input.customer.email || null,
            input.customer.note || null,
          ],
        )

        const savedItems = []
        for (const item of input.items) {
          const product = products.get(item.productId)!
          const savedItem = {
            productId: product!.id,
            slug: product!.slug,
            sku: product!.sku,
            productName: product!.name,
            image: product!.images[0] ?? '',
            ...(item.specification ? { specification: item.specification } : {}),
            quantity: item.quantity,
            unitPrice: product!.price,
            ...(item.note ? { note: item.note } : {}),
          }
          savedItems.push(savedItem)
          await client.query(
            `INSERT INTO inquiry_items (
              inquiry_id, product_id, slug, sku, product_name, image_url,
              specification, quantity, unit_price, note
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              id, savedItem.productId, savedItem.slug, savedItem.sku,
              savedItem.productName, savedItem.image,
              savedItem.specification ?? null, savedItem.quantity,
              savedItem.unitPrice, savedItem.note ?? null,
            ],
          )
        }

        return {
          id,
          customer: input.customer,
          items: savedItems,
          status: 'pending' as const,
          submittedAt: new Date().toISOString(),
        }
      })

      response.status(201).json({ inquiry })
    } catch (error) {
      next(error)
    }
  })

  router.get(
    '/admin',
    requireAuth(['ADMIN', 'OWNER']),
    async (_request, response, next) => {
      try {
        const result = await db.query<InquiryRow>(
          `${inquirySelectSql} GROUP BY i.id ORDER BY i.submitted_at DESC`,
        )
        response.json({ inquiries: result.rows.map(mapInquiry) })
      } catch (error) {
        next(error)
      }
    },
  )

  router.put(
    '/admin/:id/status',
    requireAuth(['ADMIN', 'OWNER']),
    async (request, response, next) => {
      try {
        const status = inquiryStatusSchema.parse(request.body?.status)
        const result = await db.query<InquiryRow>(
          'UPDATE inquiries SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
          [status, request.params.id],
        )
        if (!result.rows[0]) {
          response.status(404).json({ error: 'INQUIRY_NOT_FOUND' })
          return
        }
        response.json({ id: request.params.id, status })
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
