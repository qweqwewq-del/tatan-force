import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuoteTotals } from './QuoteTotals'

describe('QuoteTotals', () => {
  it('renders subtotal, fees and safe integer total', () => {
    render(
      <QuoteTotals
        fees={[
          { id: 'shipping', label: '运输与安装', amount: 18_000 },
          { id: 'discount', label: '项目折扣', amount: -20_000 },
        ]}
        subtotal={2_220_000}
      />,
    )

    expect(screen.getByText('¥22200.00')).toBeInTheDocument()
    expect(screen.getByText('¥180.00')).toBeInTheDocument()
    expect(screen.getByText('¥-200.00')).toBeInTheDocument()
    expect(screen.getByText('¥22180.00')).toBeInTheDocument()
  })
})
