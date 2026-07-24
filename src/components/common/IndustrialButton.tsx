import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'

export type IndustrialButtonVariant = 'primary' | 'secondary' | 'outline'

export interface IndustrialButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IndustrialButtonVariant
  fullWidth?: boolean
  leading?: ReactNode
}

export const IndustrialButton = forwardRef<
  HTMLButtonElement,
  IndustrialButtonProps
>(function IndustrialButton(
  {
    variant = 'primary',
    fullWidth = false,
    leading,
    className = '',
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const classes = [
    'industrial-button',
    `industrial-button--${variant}`,
    fullWidth ? 'industrial-button--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} className={classes} type={type} {...props}>
      {leading && <span className="industrial-button__leading">{leading}</span>}
      <span>{children}</span>
    </button>
  )
})
