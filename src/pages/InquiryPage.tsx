import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../app/useDocumentMeta'
import { EmptyState } from '../components/common/EmptyState'
import { SectionHeader } from '../components/common/SectionHeader'
import { InquiryItem } from '../components/inquiry/InquiryItem'
import { InquiryProgress } from '../components/inquiry/InquiryProgress'
import { useInquiry } from '../features/inquiry/InquiryContext'
import { calculateSubtotal, centToYuan } from '../features/inquiry/money'

export function InquiryPage() {
  const {
    items,
    getTotalItems,
    removeItem,
    updateNote,
    updateQuantity,
  } = useInquiry()
  const subtotal = calculateSubtotal(items)

  useDocumentMeta(
    '询价清单｜TATAN FORCE',
    '调整 TATAN FORCE 产品数量、采购备注并进入客户资料填写。',
  )

  return (
    <div className="inquiry-page flow-page page-enter">
      <header className="flow-masthead">
        <div className="container">
          <p>INQUIRY / STEP 01</p>
          <h1>询价清单</h1>
          <span>确认设备、数量与采购要求</span>
        </div>
      </header>

      <div className="container flow-page__body">
        <InquiryProgress currentStep={1} />

        {items.length === 0 ? (
          <EmptyState
            title="询价清单为空"
            description="从产品中心选择设备并加入询价后，可在这里统一调整数量。"
            action={
              <Link className="industrial-link industrial-link--primary" to="/products">
                浏览产品
              </Link>
            }
          />
        ) : (
          <div className="inquiry-layout">
            <section className="inquiry-list" aria-labelledby="inquiry-items-title">
              <SectionHeader
                eyebrow="SELECTED EQUIPMENT"
                title="已选设备"
                description={`${items.length} 个产品条目，共 ${getTotalItems()} 件设备`}
              />
              <div id="inquiry-items-title" className="inquiry-list__items">
                {items.map((item) => (
                  <InquiryItem
                    item={item}
                    key={item.productId}
                    onNoteChange={(note) => updateNote(item.productId, note)}
                    onQuantityChange={(quantity) =>
                      updateQuantity(item.productId, quantity)
                    }
                    onRemove={() => removeItem(item.productId)}
                  />
                ))}
              </div>
            </section>

            <aside className="inquiry-summary" aria-label="询价清单汇总">
              <p className="eyebrow">INQUIRY SUMMARY</p>
              <h2>清单汇总</h2>
              <dl>
                <div><dt>产品条目</dt><dd>{items.length}</dd></div>
                <div><dt>设备总数</dt><dd>{getTotalItems()}</dd></div>
                <div><dt>产品参考金额</dt><dd>¥{centToYuan(subtotal)}</dd></div>
              </dl>
              <p>最终价格将根据规格、数量、运输及安装需求由销售顾问确认。</p>
              <Link
                className="industrial-link industrial-link--primary"
                to="/inquiry/contact"
              >
                填写客户资料 →
              </Link>
              <Link className="inquiry-summary__back" to="/products">
                继续浏览产品
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
