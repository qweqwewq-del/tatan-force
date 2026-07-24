import type { SpecItem } from '../../models/product'

export interface ProductSpecTableProps {
  specifications: SpecItem[]
  caption?: string
}

export function ProductSpecTable({
  specifications,
  caption = '产品规格参数',
}: ProductSpecTableProps) {
  return (
    <div className="spec-table-wrap">
      <table className="spec-table">
        <caption>{caption}</caption>
        <tbody>
          {specifications.map((spec, index) => (
            <tr key={spec.id}>
              <th scope="row">
                <span>{String(index + 1).padStart(2, '0')}</span>
                {spec.label}
              </th>
              <td>
                {spec.value}
                {spec.unit ? ` ${spec.unit}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
