import { Link } from 'react-router-dom'
import { useInquiry } from '../../features/inquiry/InquiryContext'
import { EmptyState } from '../common/EmptyState'
import { IndustrialButton } from '../common/IndustrialButton'
import { Modal } from '../common/Modal'
import { InquiryItem } from './InquiryItem'

export interface InquiryDrawerProps {
  open: boolean
  onClose: () => void
}

export function InquiryDrawer({ open, onClose }: InquiryDrawerProps) {
  const {
    items,
    getTotalItems,
    removeItem,
    updateQuantity,
  } = useInquiry()

  return (
    <Modal
      footer={
        items.length > 0 ? (
          <div className="inquiry-drawer__footer">
            <span>共 {getTotalItems()} 件产品</span>
            <Link className="industrial-link industrial-link--primary" to="/inquiry">
              查看询价清单
            </Link>
          </div>
        ) : undefined
      }
      onClose={onClose}
      open={open}
      title="询价清单"
    >
      {items.length === 0 ? (
        <EmptyState
          action={
            <IndustrialButton onClick={onClose} variant="outline">
              继续浏览产品
            </IndustrialButton>
          }
          description="从产品目录加入设备后，可在这里统一调整数量并提交询价。"
          title="询价清单为空"
        />
      ) : (
        <div className="inquiry-drawer__items">
          {items.map((item) => (
            <InquiryItem
              compact
              item={item}
              key={item.productId}
              onQuantityChange={(quantity) =>
                updateQuantity(item.productId, quantity)
              }
              onRemove={() => removeItem(item.productId)}
            />
          ))}
        </div>
      )}
    </Modal>
  )
}
