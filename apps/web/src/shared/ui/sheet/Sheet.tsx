import { useEffect, type PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import styles from './Sheet.module.css'

type SheetProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  closeLabel?: string
}>

export function Sheet({
  children,
  isOpen,
  onClose,
  closeLabel = 'Close',
}: SheetProps) {
  useEffect(() => {
    document.body.dataset.sheetOpen = String(isOpen)

    return () => {
      delete document.body.dataset.sheetOpen
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return createPortal(
    <>
      <button
        aria-label={closeLabel}
        className={styles.overlay}
        type="button"
        onClick={onClose}
      />
      <div className={styles.sheet}>
        <div aria-hidden="true" className={styles.handle} />
        {children}
      </div>
    </>,
    document.body
  )
}
