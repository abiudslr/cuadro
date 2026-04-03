import { useMemo } from 'react'
import { calculateGridLayout } from '@/features/editor/domain/gridLayoutEngine'
import { useElementSize } from '@/shared/hooks/useElementSize'
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

  const { elementRef, size } = useElementSize<HTMLDivElement>()
  const layout = useMemo(
    () =>
      calculateGridLayout({
        orientation,
        aspectRatio,
        rows,
        columns,
        marginWidth,
        containerWidth: size.width,
        containerHeight: size.height,
      }),
    [aspectRatio, columns, marginWidth, orientation, rows, size.height, size.width]
  )

  return (
    <Panel className={styles.canvasPanel} elevated>
      <div className={styles.previewFrame}>
        <div ref={elementRef} className={styles.previewViewport}>
          <div
            className={styles.previewCanvas}
            style={{
              width: `${layout.canvasWidth}px`,
              height: `${layout.canvasHeight}px`,
              background: marginColor,
            }}
          >
            {layout.cells.map((cell) => (
              <div
                key={cell.id}
                className={styles.previewCell}
                style={{
                  left: `${cell.x}px`,
                  top: `${cell.y}px`,
                  width: `${cell.width}px`,
                  height: `${cell.height}px`,
                  background: emptyCellColor,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}
