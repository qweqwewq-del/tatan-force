import { useState, type ChangeEvent, type FormEvent } from 'react'
import { IndustrialButton } from '../../components/common/IndustrialButton'
import { Toast } from '../../components/common/Toast'
import { useSiteSettings } from '../../features/settings/useSiteSettings'
import { updateSiteSettings } from '../../services/settings-api'
import { uploadImage } from '../../services/upload-api'

export function AdminSettingsPage() {
  const { settings, setSettings } = useSiteSettings()
  const [message, setMessage] = useState('')

  function updateField<Key extends keyof typeof settings>(
    key: Key,
    value: (typeof settings)[Key],
  ) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  async function handleImage(
    event: ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'qrCodeUrl',
  ) {
    const file = event.target.files?.[0]

    if (!file || !file.type.startsWith('image/') || file.size > 2_500_000) {
      setMessage('请选择不超过 2.5MB 的图片文件。')
      return
    }

    try {
      updateField(field, await uploadImage(file))
      setMessage('图片已上传，保存设置后生效。')
    } catch {
      setMessage('图片上传失败，请稍后重试。')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setSettings(await updateSiteSettings(settings))
      setMessage('网站与报价设置已保存。')
    } catch {
      setMessage('保存失败，请检查网络或字段内容。')
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">SITE CONFIGURATION / 03</p>
          <h1>网站设置</h1>
          <span>品牌信息、联系方式与报价默认值</span>
        </div>
      </header>
      <form className="admin-form settings-form" onSubmit={handleSubmit}>
        <section className="admin-panel">
          <header><span>01</span><div><h2>品牌信息</h2><p>官网与报价文件使用的品牌资料</p></div></header>
          <div className="admin-form__grid">
            <label className="admin-field"><span>品牌名称</span><input required value={settings.brandName} onChange={(event) => updateField('brandName', event.target.value)} /></label>
            <label className="admin-field"><span>企业名称</span><input required value={settings.legalName} onChange={(event) => updateField('legalName', event.target.value)} /></label>
            <label className="admin-field"><span>联系电话</span><input required value={settings.phone} onChange={(event) => updateField('phone', event.target.value)} /></label>
            <label className="admin-field"><span>微信号</span><input required value={settings.wechat} onChange={(event) => updateField('wechat', event.target.value)} /></label>
            <label className="admin-field"><span>销售邮箱</span><input required type="email" value={settings.email} onChange={(event) => updateField('email', event.target.value)} /></label>
          </div>
          <div className="settings-assets">
            <label className="admin-field"><span>Logo 上传</span><input accept="image/*" type="file" onChange={(event) => handleImage(event, 'logoUrl')} /></label>
            <img src={settings.logoUrl} alt="当前品牌 Logo" />
            <label className="admin-field"><span>微信二维码上传</span><input accept="image/*" type="file" onChange={(event) => handleImage(event, 'qrCodeUrl')} /></label>
            <img src={settings.qrCodeUrl} alt="当前微信二维码" />
          </div>
        </section>
        <section className="admin-panel">
          <header><span>02</span><div><h2>报价设置</h2><p>报价预览页面使用的默认信息</p></div></header>
          <div className="admin-form__grid">
            <label className="admin-field"><span>报价单标题</span><input required value={settings.quoteTitle} onChange={(event) => updateField('quoteTitle', event.target.value)} /></label>
            <label className="admin-field"><span>默认有效期（天）</span><input min={1} max={365} required type="number" value={settings.quoteValidityDays} onChange={(event) => updateField('quoteValidityDays', Number(event.target.value))} /></label>
          </div>
          <label className="admin-field"><span>销售备注</span><textarea rows={4} value={settings.defaultSalesNote} onChange={(event) => updateField('defaultSalesNote', event.target.value)} /></label>
        </section>
        <IndustrialButton type="submit">保存全部设置</IndustrialButton>
      </form>
      {message && <div className="admin-toast"><Toast message={message} tone={message.startsWith('保存失败') ? 'error' : 'success'} onDismiss={() => setMessage('')} /></div>}
    </section>
  )
}
