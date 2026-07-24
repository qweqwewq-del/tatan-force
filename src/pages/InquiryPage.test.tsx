import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { products } from '../data/products.mock'
import { InquiryProvider } from '../features/inquiry/InquiryContext'
import { saveInquiryItems } from '../services/inquiry-storage'
import { InquiryPage } from './InquiryPage'

const product = products[0]

describe('InquiryPage', () => {
  beforeEach(() => {
    saveInquiryItems([
      {
        productId: product.id,
        slug: product.slug,
        sku: product.sku,
        productName: product.name,
        image: product.images[0],
        quantity: 1,
        unitPrice: product.price,
      },
    ])
  })

  it('displays an added product and updates its quantity', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <InquiryProvider>
          <InquiryPage />
        </InquiryProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: `增加${product.name}数量` }),
    )

    expect(
      screen.getByLabelText(`${product.name}数量 2`),
    ).toHaveTextContent('02')
    expect(screen.getByText('设备总数').nextSibling).toHaveTextContent('2')
  })
})
