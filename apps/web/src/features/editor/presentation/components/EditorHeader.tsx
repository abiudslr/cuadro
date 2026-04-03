import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/ui/button/Button'
import { LanguageSwitcher } from '@/shared/ui/language-switcher/LanguageSwitcher'
import { Panel } from '@/shared/ui/panel/Panel'
import styles from './editor.module.css'

type EditorHeaderProps = {
  onOpenExport: () => void
}

export function EditorHeader({ onOpenExport }: EditorHeaderProps) {
  const { t } = useI18n()

  return (
    <Panel className={styles.header}>
      <h1 className={styles.title}>{t('editor.header.title')}</h1>

      <div className={styles.headerActions}>
        <Button variant="primary" onClick={onOpenExport}>
          {t('editor.export.action')}
        </Button>
        <LanguageSwitcher />
      </div>
    </Panel>
  )
}
