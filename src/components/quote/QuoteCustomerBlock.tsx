import type { Customer } from '../../models/inquiry'

export interface QuoteCustomerBlockProps {
  customer: Customer
}

export function QuoteCustomerBlock({
  customer,
}: QuoteCustomerBlockProps) {
  const rows = [
    ['客户姓名', customer.name],
    ['联系电话', customer.phone],
    ['微信', customer.wechat],
    ['公司', customer.company],
    ['地址', customer.address],
    ['邮箱', customer.email],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <section className="quote-customer">
      <h2>客户信息</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
