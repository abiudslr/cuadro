import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/button/Button'
import {
  DownloadIcon,
  GridIcon,
  HorizontalIcon,
  SlidersIcon,
  VerticalIcon,
} from '@/shared/ui/icons/Icons'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import styles from './editor.module.css'

type EditorQuickBarProps = {
  floating?: boolean
  onOpenExport: () => void
}

export function EditorQuickBar({
  floating = false,
  onOpenExport,
}: EditorQuickBarProps) {
  const { t } = useI18n()
  const { aspectRatio, columns, openConfigSheet, orientation, rows } =
    useEditorStore(
      useShallow((state) => ({
        orientation: state.orientation,
        aspectRatio: state.aspectRatio,
        rows: state.rows,
        columns: state.columns,
        openConfigSheet: state.openConfigSheet,
      }))
    )

  const OrientationIcon =
    orientation === 'vertical' ? VerticalIcon : HorizontalIcon

  return (
    <div className={floating ? styles.mobileDock : styles.quickBar}>
      <Button className={styles.quickExportButton} variant="primary" onClick={onOpenExport}>
        <span className={styles.quickExportIcon}>
          <DownloadIcon />
        </span>
        {t('editor.export.action')}
      </Button>

      <div className={styles.quickMetrics}>
        <div
          aria-label={`${t('editor.mobileDock.orientation')}: ${t(
            `editor.config.orientation.${orientation}`
          )}`}
          className={styles.metricChip}
        >
          <span className={styles.metricIcon}>
            <OrientationIcon />
          </span>
        </div>

        <div
          aria-label={`${t('editor.mobileDock.aspectRatio')}: ${aspectRatio}`}
          className={styles.metricChip}
        >
          <span className={styles.metricValue}>{aspectRatio}</span>
        </div>

        <div
          aria-label={`${t('editor.mobileDock.cells')}: ${rows} x ${columns}`}
          className={styles.metricChip}
        >
          <span className={styles.metricIcon}>
            <GridIcon />
          </span>
          <span className={styles.metricValue}>
            {rows}x{columns}
          </span>
        </div>
      </div>

      <IconButton
        aria-label={t('common.openSettings')}
        className={styles.quickSettingsButton}
        compact={floating}
        onClick={openConfigSheet}
      >
        <SlidersIcon />
      </IconButton>
    </div>
  )
}
