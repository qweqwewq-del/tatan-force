import wechatQr from '../assets/figma/wechat-qr.png'
import brandLogo from '../assets/figma/tatan-logo.png'

export interface SiteSettings {
  brandName: string
  legalName: string
  logoUrl: string
  phone: string
  wechat: string
  email: string
  qrCodeUrl: string
  quoteTitle: string
  quoteValidityDays: number
  defaultSalesNote: string
}

export const siteSettings: SiteSettings = {
  brandName: 'TATAN FORCE',
  legalName: '泰坦引擎体育',
  logoUrl: brandLogo,
  phone: '400-800-2026',
  wechat: 'TATAN-SALES',
  email: 'sales@tatanforce.cn',
  qrCodeUrl: wechatQr,
  quoteTitle: 'TATAN FORCE 产品报价单',
  quoteValidityDays: 30,
  defaultSalesNote: '价格含税；运输与安装费用根据项目地址核算。',
}
