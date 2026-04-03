import type { HTMLAttributes, PropsWithChildren } from 'react'
import styles from './Panel.module.css'

type PanelProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    elevated?: boolean
  }
>

export function Panel({
  children,
  className = '',
  elevated = false,
  ...props
}: PanelProps) {
  return (
    <div
      className={[
        styles.panel,
        elevated ? styles.elevated : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
