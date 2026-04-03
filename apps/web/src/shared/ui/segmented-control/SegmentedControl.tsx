import type { CSSProperties } from 'react'
import styles from './SegmentedControl.module.css'

type SegmentedControlOption<TValue extends string> = {
  value: TValue
  label: string
}

type SegmentedControlProps<TValue extends string> = {
  label: string
  value: TValue
  options: Array<SegmentedControlOption<TValue>>
  columns?: number
  onChange: (value: TValue) => void
}

export function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  columns = options.length,
  onChange,
}: SegmentedControlProps<TValue>) {
  return (
    <div
      aria-label={label}
      className={styles.root}
      role="tablist"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } as CSSProperties}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            aria-selected={isActive}
            className={[
              styles.button,
              isActive ? styles.buttonActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="tab"
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
