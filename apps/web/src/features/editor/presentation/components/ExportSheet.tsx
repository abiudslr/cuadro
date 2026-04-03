import { useMemo, useState } from 'react'
import { exportGridImage, getGridExportSize, type ExportImageFormat, type ExportResolution } from '@/features/editor/application/exportGridImage'
import { downloadExportedFile } from '@/features/editor/application/downloadExportedFile'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/button/Button'
import { SegmentedControl } from '@/shared/ui/segmented-control/SegmentedControl'
import { Sheet } from '@/shared/ui/sheet/Sheet'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import styles from './editor.module.css'

type ExportSheetProps = {
  isOpen: boolean
  onClose: () => void
}

type ExportSheetContentProps = {
  onClose: () => void
}

function ExportSheetContent({ onClose }: ExportSheetContentProps) {
  const { t } = useI18n()
  const snapshot = useEditorStore(
    useShallow((state) => ({
      orientation: state.orientation,
      aspectRatio: state.aspectRatio,
      rows: state.rows,
      columns: state.columns,
      marginWidth: state.marginWidth,
      marginColor: state.marginColor,
      emptyCellColor: state.emptyCellColor,
      placedImages: state.placedImages,
    }))
  )
  const [format, setFormat] = useState<ExportImageFormat>('png')
  const [resolution, setResolution] = useState<ExportResolution>('standard')
  const [isExporting, setIsExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const exportSize = useMemo(
    () => getGridExportSize(snapshot, resolution),
    [resolution, snapshot]
  )

  const handleClose = () => {
    if (isExporting) {
      return
    }

    setErrorMessage(null)
    onClose()
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setErrorMessage(null)

      const result = await exportGridImage(snapshot, {
        format,
        resolution,
      })

      downloadExportedFile(result.blob, result.fileName)
      onClose()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t('editor.export.errors.generic')
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={styles.exportSheet}>
      <div className={styles.sheetHeader}>
        <div className={styles.configSectionHeader}>
          <h2 className={styles.sectionTitle}>{t('editor.export.title')}</h2>
          <p className={styles.helperText}>{t('editor.export.subtitle')}</p>
        </div>
        <Button disabled={isExporting} variant="ghost" onClick={handleClose}>
          {t('common.close')}
        </Button>
      </div>

      <div className={styles.exportBody}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.export.formatLabel')}</span>
          <SegmentedControl
            label={t('editor.export.formatLabel')}
            options={[
              { value: 'png', label: 'PNG' },
              { value: 'jpeg', label: 'JPG' },
            ]}
            value={format}
            onChange={setFormat}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.export.sizeLabel')}</span>
          <SegmentedControl
            label={t('editor.export.sizeLabel')}
            options={[
              { value: 'standard', label: t('editor.export.sizes.standard') },
              { value: 'high', label: t('editor.export.sizes.high') },
            ]}
            value={resolution}
            onChange={setResolution}
          />
          <p className={styles.exportMeta}>
            {exportSize.width} x {exportSize.height} px
          </p>
        </div>

        {errorMessage ? <p className={styles.exportError}>{errorMessage}</p> : null}
      </div>

      <div className={styles.exportActions}>
        <Button disabled={isExporting} variant="ghost" onClick={handleClose}>
          {t('common.close')}
        </Button>
        <Button disabled={isExporting} variant="primary" onClick={handleExport}>
          {isExporting ? t('editor.export.exporting') : t('editor.export.action')}
        </Button>
      </div>
    </div>
  )
}

export function ExportSheet({ isOpen, onClose }: ExportSheetProps) {
  const { t } = useI18n()

  return (
    <Sheet
      closeLabel={t('editor.export.close')}
      isOpen={isOpen}
      onClose={onClose}
    >
      {isOpen ? <ExportSheetContent onClose={onClose} /> : null}
    </Sheet>
  )
}
