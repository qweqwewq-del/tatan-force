import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentMeta } from '../app/useDocumentMeta'
import { ErrorState } from '../components/common/ErrorState'
import { Toast, type ToastTone } from '../components/common/Toast'
import { CustomerForm } from '../components/inquiry/CustomerForm'
import { InquiryProgress } from '../components/inquiry/InquiryProgress'
import { useInquiry } from '../features/inquiry/InquiryContext'
import type { Customer } from '../models/inquiry'

export function InquiryContactPage() {
  const { customer, items, saveCustomer } = useInquiry()
  const navigate = useNavigate()
  const redirectTimer = useRef<number | null>(null)
  const [toast, setToast] = useState<{
    message: string
    tone: ToastTone
  } | null>(null)

  useDocumentMeta(
    '填写客户资料｜TATAN FORCE',
    '填写姓名、手机、公司和项目需求，用于生成 TATAN FORCE 报价预览。',
  )

  useEffect(
    () => () => {
      if (redirectTimer.current !== null) {
        window.clearTimeout(redirectTimer.current)
      }
    },
    [],
  )

  const handleSubmit = (nextCustomer: Customer) => {
    if (!saveCustomer(nextCustomer)) {
      setToast({
        message: '客户资料保存失败，请检查浏览器存储设置后重试。',
        tone: 'error',
      })
      return
    }

    setToast({ message: '客户资料已保存，正在生成报价预览。', tone: 'success' })
    redirectTimer.current = window.setTimeout(() => {
      navigate('/inquiry/preview')
    }, 320)
  }

  if (items.length === 0) {
    return (
      <div className="container flow-error page-enter">
        <ErrorState
          title="尚未选择询价产品"
          message="请先从产品中心加入设备，再填写客户资料。"
        />
        <Link className="industrial-link industrial-link--primary" to="/products">
          前往产品中心
        </Link>
      </div>
    )
  }

  return (
    <div className="flow-page inquiry-contact-page page-enter">
      <header className="flow-masthead flow-masthead--compact">
        <div className="container">
          <p>INQUIRY / STEP 02</p>
          <h1>客户资料</h1>
          <span>用于项目沟通与正式报价</span>
        </div>
      </header>

      <div className="container flow-page__body">
        <InquiryProgress currentStep={2} />
        {toast && (
          <div className="flow-toast">
            <Toast
              message={toast.message}
              onDismiss={() => setToast(null)}
              tone={toast.tone}
            />
          </div>
        )}
        <div className="contact-layout">
          <section className="contact-form-panel">
            <div>
              <p className="eyebrow">CUSTOMER INFORMATION</p>
              <h2>填写联系信息</h2>
              <p>姓名与手机为必填项，其余信息可帮助销售顾问准备更准确的方案。</p>
            </div>
            <CustomerForm
              initialValue={customer ?? undefined}
              onSubmit={handleSubmit}
              submitLabel="保存并预览报价"
            />
          </section>
          <aside className="contact-assurance">
            <span>02 / 04</span>
            <h2>资料仅用于本次询价</h2>
            <p>客户资料将在确认提交后通过加密连接写入服务器，不会保存在浏览器长期存储中。</p>
            <ul>
              <li>确认采购设备与数量</li>
              <li>生成本地报价预览</li>
              <li>提交后生成询价编号</li>
            </ul>
            <Link to="/inquiry">← 返回询价清单</Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
