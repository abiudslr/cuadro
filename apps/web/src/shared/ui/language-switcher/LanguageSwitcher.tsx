import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { CheckIcon, GlobeIcon } from '@/shared/ui/icons/Icons'
import styles from './LanguageSwitcher.module.css'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('common.language')}
        className={styles.trigger}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <GlobeIcon />
      </button>

      {isOpen ? (
        <div aria-label={t('common.language')} className={styles.menu} role="menu">
          <button
            aria-pressed={language === 'en'}
            className={[
              styles.button,
              language === 'en' ? styles.buttonActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="menuitemradio"
            type="button"
            onClick={() => {
              setLanguage('en')
              setIsOpen(false)
            }}
          >
            <span>{t('common.english')}</span>
            {language === 'en' ? <CheckIcon /> : null}
          </button>
          <button
            aria-pressed={language === 'es'}
            className={[
              styles.button,
              language === 'es' ? styles.buttonActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="menuitemradio"
            type="button"
            onClick={() => {
              setLanguage('es')
              setIsOpen(false)
            }}
          >
            <span>{t('common.spanish')}</span>
            {language === 'es' ? <CheckIcon /> : null}
          </button>
        </div>
      ) : null}
    </div>
  )
}
