import { useMemo } from 'react'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/ui/button/Button'
import { LanguageSwitcher } from '@/shared/ui/language-switcher/LanguageSwitcher'
import { Panel } from '@/shared/ui/panel/Panel'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import styles from './editor.module.css'

export function EditorHeader() {
  const { t } = useI18n()
  const { aspectRatio, columns, emptyCellColor, marginColor, marginWidth, orientation, rows } =
    useEditorStore(
      useShallow((state) => ({
        orientation: state.orientation,
        aspectRatio: state.aspectRatio,
        rows: state.rows,
        columns: state.columns,
        marginWidth: state.marginWidth,
        marginColor: state.marginColor,
        emptyCellColor: state.emptyCellColor,
      }))
    )

  const savePayload = useMemo(
    () => ({
      orientation,
      aspectRatio,
      rows,
      columns,
      marginWidth,
      marginColor,
      emptyCellColor,
    }),
    [
      aspectRatio,
      columns,
      emptyCellColor,
      marginColor,
      marginWidth,
      orientation,
      rows,
    ]
  )

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(savePayload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'cuadro-config.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Panel className={styles.header}>
      <h1 className={styles.title}>{t('editor.header.title')}</h1>

      <div className={styles.headerActions}>
        <Button variant="primary" onClick={handleSave}>
          {t('common.save')}
        </Button>
        <LanguageSwitcher />
      </div>
    </Panel>
  )
}
