export interface WechatQrBlockProps {
  src: string
  label?: string
}

export function WechatQrBlock({
  src,
  label = '扫码添加销售微信',
}: WechatQrBlockProps) {
  return (
    <figure className="wechat-qr">
      <img src={src} alt="销售微信二维码" />
      <figcaption>{label}</figcaption>
    </figure>
  )
}
