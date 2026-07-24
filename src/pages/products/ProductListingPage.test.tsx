import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { products } from '../../data/products.mock'
import { InquiryProvider } from '../../features/inquiry/InquiryContext'
import { ProductListingPage } from './ProductListingPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <InquiryProvider>
        <ProductListingPage />
      </InquiryProvider>
    </MemoryRouter>,
  )
}

describe('ProductListingPage', () => {
  it('renders all products by default', () => {
    renderPage()

    expect(screen.getByTestId('product-grid').children).toHaveLength(
      products.length,
    )
  })

  it('filters products by category', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '杠铃片' }))

    expect(screen.getByTestId('product-grid').children).toHaveLength(2)
    expect(screen.getByText('彩色竞技杠铃片')).toBeInTheDocument()
    expect(screen.getByText('三孔包胶杠铃片')).toBeInTheDocument()
    expect(screen.queryByText('深蹲架与举重台')).not.toBeInTheDocument()
  })
})
