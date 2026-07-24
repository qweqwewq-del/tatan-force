import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { QuantityControl } from './QuantityControl'

function QuantityHarness() {
  const [value, setValue] = useState(1)
  return <QuantityControl onChange={setValue} value={value} />
}

describe('QuantityControl', () => {
  it('increments and decrements within the allowed range', async () => {
    const user = userEvent.setup()
    render(<QuantityHarness />)

    await user.click(screen.getByRole('button', { name: '增加数量' }))
    expect(screen.getByLabelText('数量 2')).toHaveTextContent('02')

    await user.click(screen.getByRole('button', { name: '减少数量' }))
    expect(screen.getByLabelText('数量 1')).toHaveTextContent('01')
  })
})
