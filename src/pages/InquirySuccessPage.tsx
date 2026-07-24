import { Link, useSearchParams } from 'react-router-dom'
import { useDocumentMeta } from '../app/useDocumentMeta'
import { ErrorState } from '../components/common/ErrorState'
import { InquiryProgress } from '../components/inquiry/InquiryProgress'
import { SalesContactBlock } from '../components/quote/SalesContactBlock'
import { WechatQrBlock } from '../components/quote/WechatQrBlock'
import { useInquiry } from '../features/inquiry/InquiryContext'
import { useSiteSettings } from '../features/settings/useSiteSettings'

export function InquirySuccessPage() {
  const { settings: siteSettings } = useSiteSettings()
  const { lastSubmittedInquiry } = useInquiry()
  const [searchParams] = useSearchParams()
  const inquiryId = searchParams.get('inquiry')
  const inquiry =
    inquiryId && lastSubmittedInquiry?.id === inquiryId
      ? lastSubmittedInquiry
      : null

  useDocumentMeta(
    '询价提交成功｜TATAN FORCE',
    'TATAN FORCE 已生成询价记录，销售顾问将根据联系方式进行后续沟通。',
  )

  if (!inquiryId) {
    return (
      <div className="container flow-error page-enter">
        <ErrorState
          title="未找到询价记录"
          message="当前页面缺少询价编号，请重新选择产品并提交询价。"
        />
        <Link className="industrial-link industrial-link--primary" to="/products">
          返回产品中心
        </Link>
      </div>
    )
  }

  const salesContact = {
    name: `${siteSettings.brandName} 销售顾问`,
    phone: siteSettings.phone,
    wechat: siteSettings.wechat,
    email: siteSettings.email,
    qrCodeUrl: siteSettings.qrCodeUrl,
  }

  return (
    <div className="flow-page inquiry-success-page page-enter">
      <div className="container flow-page__body">
        <InquiryProgress currentStep={4} />
        <section className="success-panel">
          <div className="success-panel__signal" aria-hidden="true">
            <span>OK</span>
          </div>
          <div className="success-panel__copy">
            <p className="eyebrow">INQUIRY RECEIVED</p>
            <h1>询价提交成功</h1>
            <p>
              询价记录已安全写入服务器。销售顾问将在工作时间内根据你填写的联系方式进行沟通。
            </p>
            <dl>
              <div><dt>询价编号</dt><dd>{inquiryId}</dd></div>
              <div><dt>当前状态</dt><dd>待联系</dd></div>
              <div><dt>产品条目</dt><dd>{inquiry?.items.length ?? '已记录'}</dd></div>
              <div><dt>提交时间</dt><dd>{inquiry ? new Date(inquiry.submittedAt).toLocaleString('zh-CN') : '已提交'}</dd></div>
            </dl>
            <Link className="industrial-link industrial-link--primary" to="/products">
              返回产品中心
            </Link>
          </div>
          <aside className="success-panel__contact">
            <SalesContactBlock contact={salesContact} />
            <WechatQrBlock src={siteSettings.qrCodeUrl} />
          </aside>
        </section>
      </div>
    </div>
  )
}
