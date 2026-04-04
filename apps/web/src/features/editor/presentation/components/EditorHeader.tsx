import { useI18n } from '@/shared/i18n/useI18n'
import { LanguageSwitcher } from '@/shared/ui/language-switcher/LanguageSwitcher'
import styles from './editor.module.css'

export function EditorHeader() {
  const { t } = useI18n()

  return (
    <header className={styles.header}>
      <div className={styles.headerSpacer} aria-hidden="true" />
      <h1 className={styles.title}>{t('editor.header.title')}</h1>
      <div className={styles.headerActions}>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
