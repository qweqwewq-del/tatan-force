export interface SpecItem {
  id: string
  label: string
  value: string
  unit?: string
}

export type ProductStatus = 'active' | 'draft'

export interface Product {
  id: string
  slug: string
  sku: string
  name: string
  brand: string
  category: string
  summary: string
  description: string
  images: string[]
  material: string
  dimensions: string
  weight: string
  specifications: SpecItem[]
  features: string[]
  useCases: string[]
  /**
   * Unit price in integer cents. Never store a floating-point yuan amount.
   */
  price: number
  priceVisible: boolean
  leadTime: string
  status: ProductStatus
}
