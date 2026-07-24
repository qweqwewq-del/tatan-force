import { useState } from 'react'
import { useInquiry } from '../../features/inquiry/InquiryContext'
import type { Product } from '../../models/product'
import { IndustrialButton } from '../common/IndustrialButton'

export interface InquiryAddButtonProps {
  product: Product
  quantity?: number
  specification?: string
  onAdded?: () => void
  fullWidth?: boolean
}

export function InquiryAddButton({
  product,
  quantity = 1,
  specification,
  onAdded,
  fullWidth,
}: InquiryAddButtonProps) {
  const { addItem } = useInquiry()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      productName: product.name,
      image: product.images[0],
      quantity,
      specification,
      unitPrice: product.price,
    })
    setAdded(true)
    onAdded?.()
  }

  return (
    <IndustrialButton
      aria-label={`将${product.name}加入询价`}
      fullWidth={fullWidth}
      onClick={handleAdd}
      variant={added ? 'secondary' : 'primary'}
    >
      {added ? '已加入询价' : '加入询价'}
    </IndustrialButton>
  )
}
