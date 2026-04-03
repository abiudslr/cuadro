import { useMemo } from 'react'
import { calculateGridLayout } from '@/features/editor/domain/gridLayoutEngine'
import { useElementSize } from '@/shared/hooks/useElementSize'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { PlusIcon, RefreshIcon, TrashIcon } from '@/shared/ui/icons/Icons'
import { Panel } from '@/shared/ui/panel/Panel'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import { useCellImagePicker } from '../hooks/useCellImagePicker'
import styles from './editor.module.css'

function isActionKey(key: string) {
  return key === 'Enter' || key === ' '
}

export function EditorCanvas() {
  const { t } = useI18n()
  const {
    aspectRatio,
    columns,
    emptyCellColor,
    marginColor,
    marginWidth,
    orientation,
    placeImage,
    placedImages,
    removeImage,
    selectCell,
    selectedCellId,
    rows,
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
      removeImage: state.removeImage,
      selectedCellId: state.selectedCellId,
      selectCell: state.selectCell,
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
            {layout.cells.map((cell) => {
              const image = placedImages[cell.id]
              const isSelected = selectedCellId === cell.id
              const cellLabel = image
                ? t('editor.canvas.selectImage')
                : t('editor.canvas.addImage')

              return (
                <div
                  key={cell.id}
                  className={[styles.previewCell, isSelected ? styles.previewCellSelected : '']
                    .filter(Boolean)
                    .join(' ')}
                  role="button"
                  tabIndex={0}
                  aria-label={cellLabel}
                  style={{
                    left: `${cell.x}px`,
                    top: `${cell.y}px`,
                    width: `${cell.width}px`,
                    height: `${cell.height}px`,
                    background: image ? marginColor : emptyCellColor,
                  }}
                  onClick={() => {
                    if (image) {
                      selectCell(cell.id)
                      return
                    }

                    openFilePicker(cell.id)
                  }}
                  onKeyDown={(event) => {
                    if (isActionKey(event.key)) {
                      event.preventDefault()

                      if (image) {
                        selectCell(cell.id)
                        return
                      }

                      openFilePicker(cell.id)
                    }
                  }}
                >
                  {image ? (
                    <>
                      <img
                        alt={image.name ?? ''}
                        className={styles.cellImage}
                        draggable={false}
                        src={image.objectUrl}
                      />
                      <span className={styles.cellOverlay} />
                      <div className={styles.cellActions}>
                        <button
                          className={styles.cellAction}
                          type="button"
                          aria-label={t('editor.canvas.replaceImage')}
                          title={t('editor.canvas.replaceImage')}
                          onKeyDown={(event) => {
                            event.stopPropagation()
                          }}
                          onClick={(event) => {
                            event.stopPropagation()
                            openFilePicker(cell.id)
                          }}
                        >
                          <RefreshIcon />
                        </button>
                        <button
                          className={styles.cellAction}
                          type="button"
                          aria-label={t('editor.canvas.removeImage')}
                          title={t('editor.canvas.removeImage')}
                          onKeyDown={(event) => {
                            event.stopPropagation()
                          }}
                          onClick={(event) => {
                            event.stopPropagation()
                            removeImage(cell.id)
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className={styles.emptyCellIndicator} aria-hidden="true">
                      <PlusIcon />
                    </span>
                  )}

                  {activeCellId === cell.id ? (
                    <span className={styles.cellLoading} aria-hidden="true" />
                  ) : null}
                </div>
              )
            })}
          </div>
          {input}
        </div>
      </div>
    </Panel>
  )
}
