import { useEffect, useMemo } from 'react'
import { calculateGridLayout } from '@/features/editor/domain/gridLayoutEngine'
import { useElementSize } from '@/shared/hooks/useElementSize'
import { useI18n } from '@/shared/i18n/useI18n'
import { Panel } from '@/shared/ui/panel/Panel'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import { useCellImagePicker } from '../hooks/useCellImagePicker'
import { useImagePreparationPipeline } from '../hooks/useImagePreparationPipeline'
import { EditorCanvasCell } from './EditorCanvasCell'
import styles from './editor.module.css'

export function EditorCanvas() {
  useI18n()
  const {
    aspectRatio,
    columns,
    emptyCellColor,
    marginColor,
    marginWidth,
    orientation,
    selectCell,
    rows,
    syncPlacedImagesToLayout,
  } = useEditorStore(
    useShallow((state) => ({
      orientation: state.orientation,
      aspectRatio: state.aspectRatio,
      rows: state.rows,
      columns: state.columns,
      emptyCellColor: state.emptyCellColor,
      marginWidth: state.marginWidth,
      marginColor: state.marginColor,
      selectCell: state.selectCell,
      syncPlacedImagesToLayout: state.syncPlacedImagesToLayout,
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
  const { handleZoomImage, prepareImageForCell } = useImagePreparationPipeline({
    cells: layout.cells,
  })
  const { activeCellId, input, openFilePicker } = useCellImagePicker({
    onImageSelected: prepareImageForCell,
  })

  useEffect(() => {
    if (layout.cells.length > 0) {
      syncPlacedImagesToLayout(layout.cells)
    }
  }, [layout.cells, syncPlacedImagesToLayout])

  return (
    <Panel className={styles.canvasPanel} elevated>
      <div
        className={styles.previewFrame}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            selectCell(null)
          }
        }}
      >
        <div ref={elementRef} className={styles.previewViewport}>
          <div
            className={styles.previewCanvas}
            style={{
              width: `${layout.canvasWidth}px`,
              height: `${layout.canvasHeight}px`,
              background: marginColor,
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                selectCell(null)
              }
            }}
          >
            {layout.cells.map((cell) => {
              return (
                <EditorCanvasCell
                  key={cell.id}
                  cell={cell}
                  emptyCellColor={emptyCellColor}
                  marginColor={marginColor}
                  pickerActiveCellId={activeCellId}
                  onOpenImagePicker={openFilePicker}
                  onSelectCell={selectCell}
                  onZoomImage={handleZoomImage}
                />
              )
            })}
          </div>
          {input}
        </div>
      </div>
    </Panel>
  )
}
