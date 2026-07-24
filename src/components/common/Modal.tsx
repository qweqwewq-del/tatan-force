import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IndustrialButton } from './IndustrialButton'

export interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export function Modal({ open, title, children, onClose, footer }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('modal-open')

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-panel"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-panel__header">
          <h2 id={titleId}>{title}</h2>
          <IndustrialButton
            aria-label="关闭弹窗"
            onClick={onClose}
            variant="outline"
          >
            关闭
          </IndustrialButton>
        </header>
        <div className="modal-panel__body">{children}</div>
        {footer && <footer className="modal-panel__footer">{footer}</footer>}
      </section>
    </div>,
    document.body,
  )
}
