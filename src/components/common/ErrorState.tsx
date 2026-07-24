import { IndustrialButton } from './IndustrialButton'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({
  title = '内容加载失败',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="feedback-state feedback-state--error" role="alert">
      <span className="feedback-state__marker" aria-hidden="true">
        ERR
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <IndustrialButton onClick={onRetry} variant="outline">
          重新加载
        </IndustrialButton>
      )}
    </section>
  )
}
