import { useSiteSettings } from '../../features/settings/useSiteSettings'

export function SiteFooter() {
  const { settings: siteSettings } = useSiteSettings()
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <strong>{siteSettings.brandName}</strong>
          <p>{siteSettings.legalName} · 专业力量训练装备</p>
        </div>
        <address className="site-footer__contact">
          <span>电话：{siteSettings.phone}</span>
          <span>微信：{siteSettings.wechat}</span>
          <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
        </address>
        <figure className="site-footer__qr">
          <img src={siteSettings.qrCodeUrl} alt="TATAN FORCE 微信咨询二维码" />
          <figcaption>微信咨询</figcaption>
        </figure>
        <p className="site-footer__copyright">
          © {new Date().getFullYear()} TATAN FORCE. 保留所有权利。
        </p>
      </div>
    </footer>
  )
}
