interface PricedItem {
  unitPrice: number
  quantity: number
}

function assertSafeCentAmount(value: number, label: string) {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${label} must be a safe integer amount in cents`)
  }
}

export function yuanToCent(value: number | string): number {
  const normalized =
    typeof value === 'number'
      ? String(value)
      : value.trim().replaceAll(',', '').replace(/^¥\s*/, '')

  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(normalized)

  if (!match) {
    throw new TypeError('Yuan amount must contain at most two decimal places')
  }

  const sign = match[1] === '-' ? -1 : 1
  const yuan = Number(match[2])
  const fraction = Number((match[3] ?? '').padEnd(2, '0'))
  const cents = sign * (yuan * 100 + fraction)

  assertSafeCentAmount(cents, 'Converted amount')
  return cents
}

export function centToYuan(cents: number): string {
  assertSafeCentAmount(cents, 'Cent amount')

  const sign = cents < 0 ? '-' : ''
  const absolute = Math.abs(cents)
  const yuan = Math.floor(absolute / 100)
  const fraction = String(absolute % 100).padStart(2, '0')

  return `${sign}${yuan}.${fraction}`
}

export function calculateSubtotal(items: readonly PricedItem[]): number {
  return items.reduce((subtotal, item) => {
    assertSafeCentAmount(item.unitPrice, 'Unit price')

    if (!Number.isSafeInteger(item.quantity) || item.quantity < 0) {
      throw new TypeError('Quantity must be a non-negative safe integer')
    }

    const lineAmount = item.unitPrice * item.quantity
    assertSafeCentAmount(lineAmount, 'Line amount')

    const nextSubtotal = subtotal + lineAmount
    assertSafeCentAmount(nextSubtotal, 'Subtotal')
    return nextSubtotal
  }, 0)
}

export function calculateTotal(
  subtotalInCents: number,
  feesInCents: readonly number[] = [],
): number {
  assertSafeCentAmount(subtotalInCents, 'Subtotal')

  return feesInCents.reduce((total, fee) => {
    assertSafeCentAmount(fee, 'Fee')
    const nextTotal = total + fee
    assertSafeCentAmount(nextTotal, 'Total')
    return nextTotal
  }, subtotalInCents)
}
