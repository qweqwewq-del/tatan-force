import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { InquiryProvider } from '../../features/inquiry/InquiryContext'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the hero and five featured products', () => {
    render(
      <MemoryRouter>
        <InquiryProvider>
          <HomePage />
        </InquiryProvider>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: '专业力量训练装备' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /浏览产品/ })).toHaveAttribute(
      'href',
      '/products',
    )
    expect(screen.getAllByRole('article')).toHaveLength(9)
  })
})
