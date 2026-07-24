import type { InquiryItem as InquiryItemModel } from '../../models/inquiry'
import { QuantityControl } from '../product/QuantityControl'

export interface InquiryItemProps {
  item: InquiryItemModel
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  onNoteChange?: (note: string) => void
  compact?: boolean
}

export function InquiryItem({
  item,
  onQuantityChange,
  onRemove,
  onNoteChange,
  compact = false,
}: InquiryItemProps) {
  return (
    <article className={`inquiry-item ${compact ? 'inquiry-item--compact' : ''}`}>
      <img src={item.image} alt={item.productName} />
      <div className="inquiry-item__copy">
        <p>{item.sku}</p>
        <h3>{item.productName}</h3>
        {item.specification && <span>{item.specification}</span>}
      </div>
      <QuantityControl
        label={`${item.productName}数量`}
        onChange={onQuantityChange}
        value={item.quantity}
      />
      {!compact && onNoteChange && (
        <label className="inquiry-item__note">
          <span>采购备注</span>
          <input
            maxLength={200}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="例如：颜色、安装或交付要求"
            type="text"
            value={item.note ?? ''}
          />
        </label>
      )}
      <button className="inquiry-item__remove" onClick={onRemove} type="button">
        删除
      </button>
    </article>
  )
}
