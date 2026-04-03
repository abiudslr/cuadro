import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import styles from './IconButton.module.css'

type IconButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    compact?: boolean
  }
>

export function IconButton({
  children,
  className = '',
  compact = false,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={[
        styles.button,
        compact ? styles.buttonCompact : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type={type}
      {...props}
    >
      <span aria-hidden="true" className={styles.icon}>
        {children}
      </span>
    </button>
  )
}
