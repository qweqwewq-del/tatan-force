import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { products } from '../../data/products.mock'
import { InquiryProvider } from '../../features/inquiry/InquiryContext'
import { ProductDetailPage } from './ProductDetailPage'

function renderProductDetail(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/products/${slug}`]}>
      <InquiryProvider>
        <Routes>
          <Route path="/products/:slug" element={<ProductDetailPage />} />
        </Routes>
      </InquiryProvider>
    </MemoryRouter>,
  )
}

describe('ProductDetailPage', () => {
  it('matches the slug and renders product specifications', () => {
    const product = products[4]
    renderProductDetail(product.slug)

    expect(
      screen.getByRole('heading', { level: 1, name: product.name }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(product.material).length).toBeGreaterThan(0)
    expect(screen.getByText('最大承重')).toBeInTheDocument()
    expect(screen.getByText('800+ kg')).toBeInTheDocument()
  })

  it('shows a recoverable not-found state for an unknown slug', () => {
    renderProductDetail('unknown-product')

    expect(screen.getByRole('alert')).toHaveTextContent('未找到该产品')
    expect(screen.getByRole('link', { name: '返回产品中心' })).toHaveAttribute(
      'href',
      '/products',
    )
  })
})
