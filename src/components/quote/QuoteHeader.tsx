export interface QuoteHeaderProps {
  brandName: string
  title: string
  quoteNo: string
  quoteDate?: string
}

export function QuoteHeader({
  brandName,
  title,
  quoteNo,
  quoteDate,
}: QuoteHeaderProps) {
  return (
    <header className="quote-header">
      <div className="quote-header__brand">
        <strong>{brandName}</strong>
        <span>PROFESSIONAL STRENGTH EQUIPMENT</span>
      </div>
      <div className="quote-header__meta">
        <p>{title}</p>
        <dl>
          <div>
            <dt>报价编号</dt>
            <dd>{quoteNo}</dd>
          </div>
          {quoteDate && (
            <div>
              <dt>报价日期</dt>
              <dd>{quoteDate}</dd>
            </div>
          )}
        </dl>
      </div>
    </header>
  )
}
