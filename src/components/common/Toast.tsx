export type ToastTone = 'success' | 'error'

export interface ToastProps {
  message: string
  tone?: ToastTone
  onDismiss?: () => void
}

export function Toast({
  message,
  tone = 'success',
  onDismiss,
}: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`toast toast--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span className="toast__signal" aria-hidden="true" />
      <span>{message}</span>
      {onDismiss && (
        <button className="toast__dismiss" onClick={onDismiss} type="button">
          关闭
        </button>
      )}
    </div>
  )
}
