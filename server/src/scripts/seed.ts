import { loadConfig } from '../config.js'
import { createDatabase } from '../db.js'
import {
  applyOneTimeCredentialReset,
  ensureBootstrapAccounts,
} from '../bootstrap-credentials.js'
import { seedProducts } from '../seed-products.js'

const config = loadConfig()
const db = createDatabase(config)

try {
  await ensureBootstrapAccounts(db, config)
  const credentialsReset = await applyOneTimeCredentialReset(db, config)

  for (const product of seedProducts) {
    await db.transaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO products (
          id,slug,sku,name,brand,category,summary,description,material,dimensions,
          weight,specifications,features,use_cases,price,price_visible,lead_time,status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15,$16,$17,$18)
        ON CONFLICT (id) DO NOTHING`,
        [
          product.id, product.slug, product.sku, product.name, product.brand,
          product.category, product.summary, product.description, product.material,
          product.dimensions, product.weight, JSON.stringify(product.specifications),
          JSON.stringify(product.features), JSON.stringify(product.useCases),
          product.price, product.priceVisible, product.leadTime, product.status,
        ],
      )
      if (!inserted.rowCount) return
      for (const [index, url] of product.images.entries()) {
        await client.query(
          'INSERT INTO product_images (product_id,url,alt_text,sort_order) VALUES ($1,$2,$3,$4)',
          [product.id, url, product.name, index],
        )
      }
    })
  }
  console.info(
    `Seeded ${seedProducts.length} products and two administrator accounts.${
      credentialsReset ? ' Applied one-time credential reset.' : ''
    }`,
  )
} finally {
  await db.close()
}
