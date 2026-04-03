import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import {
  getCellImageMetrics,
  type CellViewport,
} from '@/features/editor/domain/cellImageTransform'
import type { GridCellLayout } from '@/features/editor/domain/gridLayoutEngine'
import type { PlacedImage } from '@/features/editor/domain/placedImage'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import {
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
} from '@/shared/ui/icons/Icons'
import { useCellImageGestures } from '../hooks/useCellImageGestures'
import styles from './editor.module.css'

type EditorCanvasCellProps = {
  cell: GridCellLayout
  image?: PlacedImage
  isSelected: boolean
  emptyCellColor: string
  marginColor: string
  isLoading: boolean
  onOpenImagePicker: (cellId: string) => void
  onRemoveImage: (cellId: string) => void
  onResetImage: (cellId: string, cell: CellViewport) => void
  onSelectCell: (cellId: string | null) => void
  onPanImage: (cellId: string, cell: CellViewport, deltaX: number, deltaY: number) => void
  onZoomImage: (
    cellId: string,
    cell: CellViewport,
    scaleDelta: number,
    anchor?: { x: number; y: number }
  ) => void
}

function isActionKey(key: string) {
  return key === 'Enter' || key === ' '
}

function stopCellEvent(
  event:
    | MouseEvent<HTMLButtonElement>
    | PointerEvent<HTMLButtonElement>
    | KeyboardEvent<HTMLButtonElement>
) {
  event.stopPropagation()
}

export function EditorCanvasCell({
  cell,
  image,
  isSelected,
  emptyCellColor,
  marginColor,
  isLoading,
  onOpenImagePicker,
  onRemoveImage,
  onResetImage,
  onSelectCell,
  onPanImage,
  onZoomImage,
}: EditorCanvasCellProps) {
  const { t } = useI18n()
  const gestures = useCellImageGestures({
    cellId: cell.id,
    cell,
    enabled: Boolean(image),
    onSelect: (cellId) => onSelectCell(cellId),
    onPan: onPanImage,
    onZoom: onZoomImage,
  })

  const metrics = image ? getCellImageMetrics(cell, image, image.transform) : null
  const cellLabel = image ? t('editor.canvas.selectImage') : t('editor.canvas.addImage')

  return (
    <div
      className={[
        styles.previewCell,
        image ? styles.previewCellEditable : '',
        isSelected ? styles.previewCellSelected : '',
        gestures.isDragging ? styles.previewCellDragging : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      aria-label={cellLabel}
      aria-pressed={image ? isSelected : undefined}
      style={{
        left: `${cell.x}px`,
        top: `${cell.y}px`,
        width: `${cell.width}px`,
        height: `${cell.height}px`,
        background: image ? marginColor : emptyCellColor,
      }}
      onClick={() => {
        if (image) {
          onSelectCell(cell.id)
          return
        }

        onOpenImagePicker(cell.id)
      }}
      onKeyDown={(event) => {
        if (isActionKey(event.key)) {
          event.preventDefault()

          if (image) {
            onSelectCell(cell.id)
            return
          }

          onOpenImagePicker(cell.id)
        }
      }}
      onPointerDown={gestures.onPointerDown}
      onPointerMove={gestures.onPointerMove}
      onPointerUp={gestures.onPointerUp}
      onPointerCancel={gestures.onPointerCancel}
      onWheel={gestures.onWheel}
    >
      {image && metrics ? (
        <>
          <div className={styles.cellImageViewport}>
            <div
              className={styles.cellImageTransform}
              style={{
                transform: `translate3d(${metrics.translateX}px, ${metrics.translateY}px, 0)`,
              }}
            >
              <img
                alt={image.name ?? ''}
                className={styles.cellImage}
                draggable={false}
                src={image.objectUrl}
                style={{
                  width: `${metrics.renderedWidth}px`,
                  height: `${metrics.renderedHeight}px`,
                }}
              />
            </div>
          </div>
          <span className={styles.cellOverlay} />

          <div className={styles.cellActions}>
            <button
              className={styles.cellAction}
              type="button"
              aria-label={t('editor.canvas.replaceImage')}
              title={t('editor.canvas.replaceImage')}
              onPointerDown={stopCellEvent}
              onKeyDown={stopCellEvent}
              onClick={(event) => {
                stopCellEvent(event)
                onOpenImagePicker(cell.id)
              }}
            >
              <RefreshIcon />
            </button>
            <button
              className={styles.cellAction}
              type="button"
              aria-label={t('editor.canvas.removeImage')}
              title={t('editor.canvas.removeImage')}
              onPointerDown={stopCellEvent}
              onKeyDown={stopCellEvent}
              onClick={(event) => {
                stopCellEvent(event)
                onRemoveImage(cell.id)
              }}
            >
              <TrashIcon />
            </button>
          </div>

          <div
            className={[
              styles.cellTransformControls,
              isSelected ? styles.cellTransformControlsVisible : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <IconButton
              aria-label={t('editor.canvas.zoomOut')}
              className={styles.cellTransformButton}
              compact
              title={t('editor.canvas.zoomOut')}
              onPointerDown={stopCellEvent}
              onClick={(event) => {
                stopCellEvent(event)
                onZoomImage(cell.id, cell, 1 / 1.15, {
                  x: cell.width / 2,
                  y: cell.height / 2,
                })
              }}
            >
              <MinusIcon />
            </IconButton>
            <IconButton
              aria-label={t('editor.canvas.resetTransform')}
              className={styles.cellTransformButton}
              compact
              title={t('editor.canvas.resetTransform')}
              onPointerDown={stopCellEvent}
              onClick={(event) => {
                stopCellEvent(event)
                onResetImage(cell.id, cell)
              }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              aria-label={t('editor.canvas.zoomIn')}
              className={styles.cellTransformButton}
              compact
              title={t('editor.canvas.zoomIn')}
              onPointerDown={stopCellEvent}
              onClick={(event) => {
                stopCellEvent(event)
                onZoomImage(cell.id, cell, 1.15, {
                  x: cell.width / 2,
                  y: cell.height / 2,
                })
              }}
            >
              <PlusIcon />
            </IconButton>
          </div>
        </>
      ) : (
        <span className={styles.emptyCellIndicator} aria-hidden="true">
          <PlusIcon />
        </span>
      )}

      {isLoading ? <span className={styles.cellLoading} aria-hidden="true" /> : null}
    </div>
  )
}
