import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { products } from '../../data/products.mock'
import {
  InquiryProvider,
  useInquiry,
} from '../../features/inquiry/InquiryContext'
import { InquiryAddButton } from './InquiryAddButton'

function ItemCount() {
  const { getTotalItems } = useInquiry()
  return <output aria-label="询价总数">{getTotalItems()}</output>
}

describe('InquiryAddButton', () => {
  it('adds a product to the inquiry context', async () => {
    const user = userEvent.setup()
    const product = products[0]

    render(
      <InquiryProvider>
        <InquiryAddButton product={product} />
        <ItemCount />
      </InquiryProvider>,
    )

    await user.click(
      screen.getByRole('button', { name: `将${product.name}加入询价` }),
    )

    expect(screen.getByLabelText('询价总数')).toHaveTextContent('1')
    expect(screen.getByRole('button')).toHaveTextContent('已加入询价')
  })
})
