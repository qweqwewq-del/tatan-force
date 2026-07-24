import type { Contact } from '../../models/quote'

export interface SalesContactBlockProps {
  contact: Contact
}

export function SalesContactBlock({
  contact,
}: SalesContactBlockProps) {
  return (
    <address className="sales-contact">
      <p>销售联系方式</p>
      <strong>{contact.name}</strong>
      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
      {contact.wechat && <span>微信：{contact.wechat}</span>}
      {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
    </address>
  )
}
