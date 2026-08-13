import { z } from 'zod'

export const roleSchema = z.enum(['OWNER', 'ADMIN'])
export const inquiryStatusSchema = z.enum(['pending', 'contacted', 'won', 'closed'])

const optionalText = z.string().trim().max(500).optional()

export const specItemSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(300),
  unit: z.string().max(40).optional(),
})

const productImageUrlSchema = z.string().max(2_000).refine(
  (value) => /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value),
  'Product images must use an uploaded path or an HTTP(S) URL.',
)

export const productSchema = z.object({
  id: z.string().min(3).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  sku: z.string().min(2).max(80),
  name: z.string().min(1).max(180),
  brand: z.string().min(1).max(120),
  category: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  description: z.string().min(1).max(10_000),
  images: z.array(productImageUrlSchema).min(1).max(20),
  material: z.string().min(1).max(500),
  dimensions: z.string().min(1).max(500),
  weight: z.string().min(1).max(300),
  specifications: z.array(specItemSchema).max(100),
  features: z.array(z.string().min(1).max(300)).max(50),
  useCases: z.array(z.string().min(1).max(300)).max(50),
  price: z.number().int().safe().nonnegative(),
  priceVisible: z.boolean(),
  leadTime: z.string().min(1).max(300),
  status: z.enum(['active', 'draft']),
})

export type ProductDto = z.infer<typeof productSchema>

export const customerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(40),
  wechat: optionalText,
  company: optionalText,
  address: z.string().trim().max(1_000).optional(),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  note: z.string().trim().max(2_000).optional(),
})

export const inquiryCreateSchema = z.object({
  customer: customerSchema,
  items: z.array(z.object({
    productId: z.string().min(1).max(120),
    quantity: z.number().int().min(1).max(999),
    specification: z.string().max(500).optional(),
    note: z.string().max(500).optional(),
  })).min(1).max(100),
})

export const siteSettingsSchema = z.object({
  brandName: z.string().min(1).max(120),
  legalName: z.string().min(1).max(180),
  logoUrl: z.string().min(1).max(2_000),
  phone: z.string().min(1).max(80),
  wechat: z.string().min(1).max(120),
  email: z.string().email().max(254),
  qrCodeUrl: z.string().min(1).max(2_000),
  quoteTitle: z.string().min(1).max(180),
  quoteValidityDays: z.number().int().min(1).max(365),
  defaultSalesNote: z.string().max(2_000),
})

export const systemConfigSchema = z.object({
  maintenanceMode: z.boolean(),
  environmentLabel: z.string().min(1).max(120),
  apiBaseUrl: z.string().min(1).max(500),
})

export interface ProductRow {
  id: string
  slug: string
  sku: string
  name: string
  brand: string
  category: string
  summary: string
  description: string
  material: string
  dimensions: string
  weight: string
  specifications: ProductDto['specifications']
  features: string[]
  use_cases: string[]
  price: string | number
  price_visible: boolean
  lead_time: string
  status: ProductDto['status']
  images: string[]
}

export function mapProduct(row: ProductRow): ProductDto {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    summary: row.summary,
    description: row.description,
    images: row.images ?? [],
    material: row.material,
    dimensions: row.dimensions,
    weight: row.weight,
    specifications: row.specifications ?? [],
    features: row.features ?? [],
    useCases: row.use_cases ?? [],
    price: Number(row.price),
    priceVisible: row.price_visible,
    leadTime: row.lead_time,
    status: row.status,
  }
}

export const productSelectSql = `
  SELECT p.*,
    COALESCE(
      jsonb_agg(pi.url ORDER BY pi.sort_order)
        FILTER (WHERE pi.id IS NOT NULL),
      '[]'::jsonb
    ) AS images
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id = p.id
`
