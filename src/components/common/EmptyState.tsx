import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <section className="feedback-state feedback-state--empty">
      <span className="feedback-state__marker" aria-hidden="true">
        00
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className="feedback-state__action">{action}</div>}
    </section>
  )
}
