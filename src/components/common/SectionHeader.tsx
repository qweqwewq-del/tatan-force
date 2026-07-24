import type { ReactNode } from 'react'

export interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  align?: 'start' | 'center'
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
}: SectionHeaderProps) {
  return (
    <header className={`section-header section-header--${align}`}>
      <div className="section-header__copy">
        {eyebrow && <p className="section-header__eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-header__description">{description}</p>}
      </div>
      {action && <div className="section-header__action">{action}</div>}
    </header>
  )
}
