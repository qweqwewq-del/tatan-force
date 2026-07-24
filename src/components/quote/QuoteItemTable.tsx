import { centToYuan } from '../../features/inquiry/money'
import type { QuoteItem } from '../../models/quote'

export interface QuoteItemTableProps {
  items: QuoteItem[]
}

export function QuoteItemTable({ items }: QuoteItemTableProps) {
  return (
    <div className="quote-table-wrap">
      <table className="quote-table">
        <caption>报价产品明细</caption>
        <thead>
          <tr>
            <th>产品</th>
            <th>规格</th>
            <th>数量</th>
            <th>单价</th>
            <th>金额</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.productId}-${item.specification ?? 'default'}`}>
              <td>
                <strong>{item.productName}</strong>
                <span>{item.sku}</span>
              </td>
              <td>{item.specification ?? '标准配置'}</td>
              <td>{item.quantity}</td>
              <td>¥{centToYuan(item.unitPrice)}</td>
              <td>¥{centToYuan(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
