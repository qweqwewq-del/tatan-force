import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { products } from '../../data/products.mock'
import { InquiryProvider } from '../../features/inquiry/InquiryContext'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('renders product content and a detail link', () => {
    const product = products[0]

    render(
      <MemoryRouter>
        <InquiryProvider>
          <ProductCard product={product} />
        </InquiryProvider>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: product.name }),
    ).toBeInTheDocument()
    expect(screen.getByText(product.summary)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: `查看${product.name}详情` }),
    ).toHaveAttribute('href', `/products/${product.slug}`)
  })
})
