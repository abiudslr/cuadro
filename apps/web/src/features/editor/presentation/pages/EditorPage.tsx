import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/button/Button'
import { DownloadIcon } from '@/shared/ui/icons/Icons'
import { Sheet } from '@/shared/ui/sheet/Sheet'
import { useEditorStore } from '../../application/editorStore'
import { EditorCanvas } from '../components/EditorCanvas'
import { ExportSheet } from '../components/ExportSheet'
import { EditorHeader } from '../components/EditorHeader'
import { EditorQuickBar } from '../components/EditorQuickBar'
import { GridConfigPanel } from '../components/GridConfigPanel'
import styles from '../components/editor.module.css'

export function EditorPage() {
  const { t } = useI18n()
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false)
  const isConfigSheetOpen = useEditorStore((state) => state.isConfigSheetOpen)
  const closeConfigSheet = useEditorStore((state) => state.closeConfigSheet)

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <EditorHeader />

        <div className={styles.workspace}>
          <div className={styles.mainColumn}>
            <div className={styles.previewShell}>
              <EditorCanvas />
            </div>
          </div>

          <aside className={styles.desktopPanel}>
            <Button
              className={styles.desktopExportButton}
              variant="primary"
              onClick={() => setIsExportSheetOpen(true)}
            >
              <span className={styles.quickExportIcon}>
                <DownloadIcon />
              </span>
              {t('editor.export.action')}
            </Button>
            <GridConfigPanel />
          </aside>
        </div>
      </div>

      <EditorQuickBar
        floating
        onOpenExport={() => setIsExportSheetOpen(true)}
      />

      <Sheet
        closeLabel={t('common.closeSettings')}
        isOpen={isConfigSheetOpen}
        onClose={closeConfigSheet}
      >
        <div className={styles.sheetHeader}>
          <div className={styles.configSectionHeader}>
            <h2 className={styles.sectionTitle}>{t('editor.config.title')}</h2>
          </div>
          <Button variant="ghost" onClick={closeConfigSheet}>
            {t('common.close')}
          </Button>
        </div>

        <GridConfigPanel elevated showHeader={false} />
      </Sheet>

      <ExportSheet
        isOpen={isExportSheetOpen}
        onClose={() => setIsExportSheetOpen(false)}
      />
    </main>
  )
}
