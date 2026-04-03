import { useEffect, useMemo } from 'react'
import { calculateGridLayout } from '@/features/editor/domain/gridLayoutEngine'
import { useElementSize } from '@/shared/hooks/useElementSize'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { Panel } from '@/shared/ui/panel/Panel'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import { useCellImagePicker } from '../hooks/useCellImagePicker'
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
    placeImage,
    placedImages,
    panImage,
    resetImageTransform,
    removeImage,
    selectCell,
    selectedCellId,
    rows,
    syncPlacedImagesToLayout,
    zoomImage,
  } = useEditorStore(
    useShallow((state) => ({
      orientation: state.orientation,
      aspectRatio: state.aspectRatio,
      rows: state.rows,
      columns: state.columns,
      emptyCellColor: state.emptyCellColor,
      marginWidth: state.marginWidth,
      marginColor: state.marginColor,
      placedImages: state.placedImages,
      placeImage: state.placeImage,
      panImage: state.panImage,
      resetImageTransform: state.resetImageTransform,
      removeImage: state.removeImage,
      selectedCellId: state.selectedCellId,
      selectCell: state.selectCell,
      syncPlacedImagesToLayout: state.syncPlacedImagesToLayout,
      zoomImage: state.zoomImage,
    }))
  )

  const { elementRef, size } = useElementSize<HTMLDivElement>()
  const { activeCellId, input, openFilePicker } = useCellImagePicker({
    onImageSelected: placeImage,
  })

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
                  image={placedImages[cell.id]}
                  isLoading={activeCellId === cell.id}
                  isSelected={selectedCellId === cell.id}
                  marginColor={marginColor}
                  onOpenImagePicker={openFilePicker}
                  onPanImage={panImage}
                  onRemoveImage={removeImage}
                  onResetImage={resetImageTransform}
                  onSelectCell={selectCell}
                  onZoomImage={zoomImage}
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
