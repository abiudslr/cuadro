import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './NumberStepper.module.css'

type NumberStepperProps = {
  value: number
  decreaseLabel: string
  increaseLabel: string
  canDecrease?: boolean
  canIncrease?: boolean
  onDecrease: () => void
  onIncrease: () => void
}

export function NumberStepper({
  value,
  decreaseLabel,
  increaseLabel,
  canDecrease = true,
  canIncrease = true,
  onDecrease,
  onIncrease,
}: NumberStepperProps) {
  return (
    <div className={styles.root}>
      <IconButton
        aria-label={decreaseLabel}
        disabled={!canDecrease}
        onClick={onDecrease}
      >
        -
      </IconButton>
      <div aria-live="polite" className={styles.value}>
        {value}
      </div>
      <IconButton
        aria-label={increaseLabel}
        disabled={!canIncrease}
        onClick={onIncrease}
      >
        +
      </IconButton>
    </div>
  )
}
