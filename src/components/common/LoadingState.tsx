export interface LoadingStateProps {
  rows?: number
  label?: string
}

export function LoadingState({
  rows = 3,
  label = '正在加载',
}: LoadingStateProps) {
  return (
    <div aria-busy="true" aria-label={label} className="loading-state" role="status">
      {Array.from({ length: rows }, (_, index) => (
        <span
          className="loading-state__row"
          key={index}
          style={{ '--loading-index': index } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
