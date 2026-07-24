import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentMeta } from '../app/useDocumentMeta'
import { ErrorState } from '../components/common/ErrorState'
import { IndustrialButton } from '../components/common/IndustrialButton'
import { Toast } from '../components/common/Toast'
import { InquiryProgress } from '../components/inquiry/InquiryProgress'
import { QuoteCustomerBlock } from '../components/quote/QuoteCustomerBlock'
import { QuoteHeader } from '../components/quote/QuoteHeader'
import { QuoteItemTable } from '../components/quote/QuoteItemTable'
import { QuoteTotals } from '../components/quote/QuoteTotals'
import { SalesContactBlock } from '../components/quote/SalesContactBlock'
import { WechatQrBlock } from '../components/quote/WechatQrBlock'
import { useInquiry } from '../features/inquiry/InquiryContext'
import { useSiteSettings } from '../features/settings/useSiteSettings'
import { createQuote } from '../features/inquiry/workflow'

export function QuotePreviewPage() {
  const { customer, items, submitInquiry } = useInquiry()
  const { settings: siteSettings } = useSiteSettings()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [quote] = useState(() =>
    customer && items.length > 0
      ? createQuote(customer, items, siteSettings)
      : null,
  )

  useDocumentMeta(
    '报价预览｜TATAN FORCE',
    '预览 TATAN FORCE 产品明细、客户信息、报价金额和商务联系方式。',
  )

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    const inquiry = await submitInquiry()

    if (!inquiry) {
      setSubmitting(false)
      setSubmitError('询价提交失败，请检查网络后重试。')
      return
    }

    navigate(`/inquiry/success?inquiry=${encodeURIComponent(inquiry.id)}`, {
      replace: true,
    })
  }

  if (!quote) {
    return (
      <div className="container flow-error page-enter">
        <ErrorState
          title="无法生成报价预览"
          message={
            items.length === 0
              ? '询价清单为空，请先选择产品。'
              : '客户资料尚未填写，请完成必填信息。'
          }
        />
        <Link
          className="industrial-link industrial-link--primary"
          to={items.length === 0 ? '/products' : '/inquiry/contact'}
        >
          {items.length === 0 ? '前往产品中心' : '填写客户资料'}
        </Link>
      </div>
    )
  }

  return (
    <div className="flow-page quote-preview-page page-enter">
      <header className="flow-masthead flow-masthead--compact">
        <div className="container">
          <p>INQUIRY / STEP 03</p>
          <h1>报价预览</h1>
          <span>提交前请确认客户与产品信息</span>
        </div>
      </header>

      <div className="container flow-page__body">
        <InquiryProgress currentStep={3} />
        {submitError && (
          <div className="flow-toast">
            <Toast
              message={submitError}
              onDismiss={() => setSubmitError(null)}
              tone="error"
            />
          </div>
        )}
        <article className="quote-sheet" aria-label="TATAN FORCE 产品报价单">
          <QuoteHeader
            brandName={siteSettings.brandName}
            quoteDate={quote.quoteDate}
            quoteNo={quote.quoteNo}
            title={siteSettings.quoteTitle}
          />
          <QuoteCustomerBlock customer={quote.customer} />
          <QuoteItemTable items={quote.items} />
          <div className="quote-sheet__totals">
            <div className="quote-sheet__validity">
              <p>报价有效期</p>
              <strong>{quote.validUntil}</strong>
              <span>{quote.remarks[0]}</span>
            </div>
            <QuoteTotals fees={quote.extraFees} subtotal={quote.subtotal} />
          </div>
          <footer className="quote-sheet__footer">
            <SalesContactBlock contact={quote.salesContact} />
            <WechatQrBlock src={siteSettings.qrCodeUrl} />
          </footer>
        </article>

        <div className="quote-actions">
          <Link className="industrial-link industrial-link--outline" to="/inquiry/contact">
            ← 修改客户资料
          </Link>
          <IndustrialButton disabled={submitting} onClick={handleSubmit}>
            {submitting ? '正在提交询价…' : '确认并提交询价'}
          </IndustrialButton>
        </div>
      </div>
    </div>
  )
}
