import { Router } from 'express'
import type { Database } from '../types.js'
import {
  mapProduct,
  productSchema,
  productSelectSql,
  type ProductDto,
  type ProductRow,
} from '../domain.js'
import { requireAuth } from '../middleware/auth.js'

async function saveProduct(db: Database, product: ProductDto) {
  await db.transaction(async (client) => {
    await client.query(
      `INSERT INTO products (
        id, slug, sku, name, brand, category, summary, description,
        material, dimensions, weight, specifications, features, use_cases,
        price, price_visible, lead_time, status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15,$16,$17,$18
      )
      ON CONFLICT (id) DO UPDATE SET
        slug=EXCLUDED.slug, sku=EXCLUDED.sku, name=EXCLUDED.name,
        brand=EXCLUDED.brand, category=EXCLUDED.category, summary=EXCLUDED.summary,
        description=EXCLUDED.description, material=EXCLUDED.material,
        dimensions=EXCLUDED.dimensions, weight=EXCLUDED.weight,
        specifications=EXCLUDED.specifications, features=EXCLUDED.features,
        use_cases=EXCLUDED.use_cases, price=EXCLUDED.price,
        price_visible=EXCLUDED.price_visible, lead_time=EXCLUDED.lead_time,
        status=EXCLUDED.status, updated_at=now()`,
      [
        product.id, product.slug, product.sku, product.name, product.brand,
        product.category, product.summary, product.description, product.material,
        product.dimensions, product.weight, JSON.stringify(product.specifications),
        JSON.stringify(product.features), JSON.stringify(product.useCases),
        product.price, product.priceVisible, product.leadTime, product.status,
      ],
    )
    await client.query('DELETE FROM product_images WHERE product_id = $1', [product.id])
    for (const [index, url] of product.images.entries()) {
      await client.query(
        'INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES ($1,$2,$3,$4)',
        [product.id, url, product.name, index],
      )
    }
  })
}

export function createProductsRouter(db: Database) {
  const router = Router()

  router.get('/', async (request, response, next) => {
    try {
      const adminView =
        request.session.user &&
        ['ADMIN', 'OWNER'].includes(request.session.user.role) &&
        request.query.scope === 'admin'
      const where = adminView ? '' : " WHERE p.status = 'active'"
      const result = await db.query<ProductRow>(
        `${productSelectSql}${where} GROUP BY p.id ORDER BY p.created_at ASC`,
      )
      response.json({ products: result.rows.map(mapProduct) })
    } catch (error) {
      next(error)
    }
  })

  router.get('/:slug', async (request, response, next) => {
    try {
      const result = await db.query<ProductRow>(
        `${productSelectSql} WHERE p.slug = $1 AND p.status = 'active' GROUP BY p.id LIMIT 1`,
        [request.params.slug],
      )
      const product = result.rows[0]
      if (!product) {
        response.status(404).json({ error: 'PRODUCT_NOT_FOUND' })
        return
      }
      response.json({ product: mapProduct(product) })
    } catch (error) {
      next(error)
    }
  })

  router.post(
    '/',
    requireAuth(['ADMIN', 'OWNER']),
    async (request, response, next) => {
      try {
        const product = productSchema.parse(request.body)
        await saveProduct(db, product)
        response.status(201).json({ product })
      } catch (error) {
        next(error)
      }
    },
  )

  router.put(
    '/:id',
    requireAuth(['ADMIN', 'OWNER']),
    async (request, response, next) => {
      try {
        const product = productSchema.parse({ ...request.body, id: request.params.id })
        await saveProduct(db, product)
        response.json({ product })
      } catch (error) {
        next(error)
      }
    },
  )

  router.delete(
    '/:id',
    requireAuth(['ADMIN', 'OWNER']),
    async (request, response, next) => {
      try {
        const result = await db.query('DELETE FROM products WHERE id = $1', [request.params.id])
        response.status(result.rowCount ? 204 : 404).end()
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
