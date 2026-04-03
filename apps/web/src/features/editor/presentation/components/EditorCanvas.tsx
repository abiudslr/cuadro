import type { CSSProperties } from 'react'
import { getPreviewAspectRatio } from '@/shared/constants/grid'
import { Panel } from '@/shared/ui/panel/Panel'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import styles from './editor.module.css'

export function EditorCanvas() {
  const {
    aspectRatio,
    columns,
    emptyCellColor,
    marginColor,
    marginWidth,
    orientation,
    rows,
  } =
    useEditorStore(
      useShallow((state) => ({
        orientation: state.orientation,
        aspectRatio: state.aspectRatio,
        rows: state.rows,
        columns: state.columns,
        emptyCellColor: state.emptyCellColor,
        marginWidth: state.marginWidth,
        marginColor: state.marginColor,
      }))
    )

  return (
    <Panel className={styles.canvasPanel} elevated>
      <div className={styles.previewFrame}>
        <div
          className={styles.previewCanvas}
          style={
            {
              '--preview-aspect-ratio': getPreviewAspectRatio(
                aspectRatio,
                orientation
              ),
              '--preview-gap': `${marginWidth}px`,
              '--preview-margin-color': marginColor,
              '--preview-cell-color': emptyCellColor,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            } as CSSProperties
          }
        >
          {Array.from({ length: rows * columns }, (_, index) => (
            <div key={index} className={styles.previewCell} />
          ))}
        </div>
      </div>
    </Panel>
  )
}
