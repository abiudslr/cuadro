import { useI18n } from '@/shared/i18n/I18nProvider'
import {
  GridIcon,
  HorizontalIcon,
  SlidersIcon,
  VerticalIcon,
} from '@/shared/ui/icons/Icons'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import { Panel } from '@/shared/ui/panel/Panel'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import styles from './editor.module.css'

type EditorQuickBarProps = {
  floating?: boolean
}

export function EditorQuickBar({ floating = false }: EditorQuickBarProps) {
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
    <Panel className={floating ? styles.mobileDock : ''} elevated>
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
        compact={floating}
        onClick={openConfigSheet}
      >
        <SlidersIcon />
      </IconButton>
    </Panel>
  )
}
