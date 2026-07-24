import { Link } from 'react-router-dom'
import { centToYuan } from '../../features/inquiry/money'
import type { Product } from '../../models/product'
import { InquiryAddButton } from './InquiryAddButton'

export interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const summarySpecs = product.specifications.slice(0, 3)

  return (
    <article className="product-card">
      <Link
        className="product-card__media"
        to={`/products/${product.slug}`}
        aria-label={`查看${product.name}详情`}
      >
        <img
          alt={product.name}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          src={product.images[0]}
        />
        <span>{product.sku}</span>
      </Link>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3>
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-card__summary">{product.summary}</p>
        <dl className="product-card__specs">
          {summarySpecs.map((spec) => (
            <div key={spec.id}>
              <dt>{spec.label}</dt>
              <dd>
                {spec.value}
                {spec.unit ? ` ${spec.unit}` : ''}
              </dd>
            </div>
          ))}
        </dl>
        <div className="product-card__footer">
          <div className="product-card__price">
            <span>{product.priceVisible ? '参考价' : '价格'}</span>
            <strong>
              {product.priceVisible
                ? `¥${centToYuan(product.price)}`
                : '询价获取'}
            </strong>
          </div>
          <InquiryAddButton product={product} />
        </div>
      </div>
    </article>
  )
}
