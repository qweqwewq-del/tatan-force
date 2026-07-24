import {
  calculateTotal,
  centToYuan,
} from '../../features/inquiry/money'
import type { QuoteFee } from '../../models/quote'

export interface QuoteTotalsProps {
  subtotal: number
  fees?: QuoteFee[]
}

export function QuoteTotals({
  subtotal,
  fees = [],
}: QuoteTotalsProps) {
  const total = calculateTotal(
    subtotal,
    fees.map((fee) => fee.amount),
  )

  return (
    <section className="quote-totals" aria-label="报价金额汇总">
      <dl>
        <div>
          <dt>产品小计</dt>
          <dd>¥{centToYuan(subtotal)}</dd>
        </div>
        {fees.map((fee) => (
          <div key={fee.id}>
            <dt>{fee.label}</dt>
            <dd>¥{centToYuan(fee.amount)}</dd>
          </div>
        ))}
        <div className="quote-totals__total">
          <dt>报价总额</dt>
          <dd>¥{centToYuan(total)}</dd>
        </div>
      </dl>
    </section>
  )
}
