import { describe, expect, it } from 'vitest'
import {
  calculateSubtotal,
  calculateTotal,
  centToYuan,
  yuanToCent,
} from './money'

describe('money utilities', () => {
  it('converts yuan without floating-point arithmetic', () => {
    expect(yuanToCent('0.10')).toBe(10)
    expect(yuanToCent('38,800.25')).toBe(3_880_025)
    expect(centToYuan(3_880_025)).toBe('38800.25')
  })

  it('calculates subtotal and fees in integer cents', () => {
    const subtotal = calculateSubtotal([
      { unitPrice: 860_000, quantity: 2 },
      { unitPrice: 125_000, quantity: 4 },
    ])

    expect(subtotal).toBe(2_220_000)
    expect(calculateTotal(subtotal, [18_000, -20_000])).toBe(2_218_000)
  })

  it('rejects yuan values with more than two decimal places', () => {
    expect(() => yuanToCent('1.001')).toThrow(TypeError)
  })
})
