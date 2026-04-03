import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  calculateWorkingImageTarget,
  defaultImagePreparationPolicyConfig,
} from '../../application/imagePreparationPolicy'
import { scheduleObjectUrlRevoke } from '../../application/objectUrl'
import { evaluateImageUpgrade } from '../../application/imageUpgradeEvaluator'
import {
  loadPlacedImageFile,
  type LoadPlacedImageFileInput,
} from '../../application/loadPlacedImageFile'
import {
  discardPreparedWorkingImage,
  upgradePlacedImageWorkingCopy,
} from '../../application/imagePreparationService'
import { useEditorStore } from '../../application/editorStore'
import type { GridCellLayout } from '../../domain/gridLayoutEngine'

type UseImagePreparationPipelineInput = {
  cells: GridCellLayout[]
}

type UpgradeReason = 'layout' | 'zoom'

const scheduledUpgradeTimeouts = new Map<string, number>()
const imagePreparationGenerations = new Map<string, number>()

function invalidateScheduledUpgrade(cellId: string) {
  const timeoutId = scheduledUpgradeTimeouts.get(cellId)

  if (typeof timeoutId === 'number') {
    window.clearTimeout(timeoutId)
    scheduledUpgradeTimeouts.delete(cellId)
  }
}

function createGenerationToken(cellId: string) {
  const nextGeneration = (imagePreparationGenerations.get(cellId) ?? 0) + 1

  imagePreparationGenerations.set(cellId, nextGeneration)
  return nextGeneration
}

function isGenerationCurrent(cellId: string, generation: number) {
  return imagePreparationGenerations.get(cellId) === generation
}

function getCellLongestSide(cell: Pick<GridCellLayout, 'width' | 'height'>) {
  return Math.max(cell.width, cell.height)
}

function getDevicePixelRatio() {
  if (typeof window === 'undefined') {
    return 1
  }

  return window.devicePixelRatio || 1
}

export function useImagePreparationPipeline({
  cells,
}: UseImagePreparationPipelineInput) {
  const scheduleRef = useRef(new Set<string>())
  const cellsById = useMemo(() => new Map(cells.map((cell) => [cell.id, cell])), [cells])
  const layoutSignature = useMemo(
    () =>
      cells
        .map((cell) => `${cell.id}:${cell.width.toFixed(3)}x${cell.height.toFixed(3)}`)
        .join('|'),
    [cells]
  )

  const prepareImageForCell = useCallback(
    async (cellId: string, file: File) => {
      const cell = cellsById.get(cellId)

      if (!cell) {
        throw new Error('Unable to prepare an image for a missing cell.')
      }

      const store = useEditorStore.getState()
      invalidateScheduledUpgrade(cellId)
      const generation = createGenerationToken(cellId)
      const input: LoadPlacedImageFileInput = {
        file,
        cellId,
        cellLongestSide: getCellLongestSide(cell),
        devicePixelRatio: getDevicePixelRatio(),
        zoomBudget: defaultImagePreparationPolicyConfig.zoomBudget,
      }

      store.setCellPreparing(cellId, true)

      try {
        const image = await loadPlacedImageFile(input)

        if (!isGenerationCurrent(cellId, generation)) {
          scheduleObjectUrlRevoke(image.working.workingUrl)
          return
        }

        const latestState = useEditorStore.getState()

        if (!latestState.preparingCellIds[cellId]) {
          scheduleObjectUrlRevoke(image.working.workingUrl)
          return
        }

        latestState.placeImage(image)
      } finally {
        if (isGenerationCurrent(cellId, generation)) {
          useEditorStore.getState().setCellPreparing(cellId, false)
        }
      }
    },
    [cellsById]
  )

  const runUpgradeCheck = useCallback(
    async (cellId: string, reason: UpgradeReason) => {
      const cell = cellsById.get(cellId)
      const store = useEditorStore.getState()
      const image = store.placedImages[cellId]

      if (!cell || !image) {
        return
      }

      const zoomBudget =
        reason === 'zoom'
          ? Math.max(defaultImagePreparationPolicyConfig.zoomBudget, image.transform.scale)
          : Math.max(
              defaultImagePreparationPolicyConfig.zoomBudget,
              image.preparation.preparedForZoomBudget,
              image.transform.scale
            )
      const target = calculateWorkingImageTarget({
        cellLongestSide: getCellLongestSide(cell),
        originalLongestSide: image.original.originalLongestSide,
        devicePixelRatio: getDevicePixelRatio(),
        zoomBudget,
      })
      const decision = evaluateImageUpgrade({
        requiredTargetLongestSide: target.targetLongestSide,
        currentWorkingLongestSide: image.working.workingLongestSide,
      })

      if (!decision.shouldUpgrade) {
        return
      }

      const generation = createGenerationToken(cellId)
      store.setCellPreparing(cellId, true)

      try {
        const prepared = await upgradePlacedImageWorkingCopy({
          image,
          cellLongestSide: getCellLongestSide(cell),
          devicePixelRatio: getDevicePixelRatio(),
          zoomBudget,
        })

        if (!isGenerationCurrent(cellId, generation)) {
          discardPreparedWorkingImage(prepared.working)
          return
        }

        const latestImage = useEditorStore.getState().placedImages[cellId]

        if (!latestImage || latestImage.id !== image.id) {
          discardPreparedWorkingImage(prepared.working)
          return
        }

        if (
          latestImage.working.workingLongestSide >= prepared.working.workingLongestSide
        ) {
          discardPreparedWorkingImage(prepared.working)
          return
        }

        useEditorStore
          .getState()
          .updateWorkingImage(cellId, prepared.working, prepared.preparation)
      } finally {
        if (isGenerationCurrent(cellId, generation)) {
          useEditorStore.getState().setCellPreparing(cellId, false)
        }
      }
    },
    [cellsById]
  )

  const scheduleUpgradeCheck = useCallback(
    (cellId: string, reason: UpgradeReason, delayMs: number) => {
      invalidateScheduledUpgrade(cellId)

      const timeoutId = window.setTimeout(async () => {
        scheduleRef.current.delete(cellId)
        scheduledUpgradeTimeouts.delete(cellId)
        await runUpgradeCheck(cellId, reason)
      }, delayMs)

      scheduleRef.current.add(cellId)
      scheduledUpgradeTimeouts.set(cellId, timeoutId)
    },
    [runUpgradeCheck]
  )

  useEffect(() => {
    const store = useEditorStore.getState()

    for (const cellId of Object.keys(store.placedImages)) {
      scheduleUpgradeCheck(cellId, 'layout', 180)
    }
  }, [layoutSignature, scheduleUpgradeCheck])

  useEffect(() => {
    const scheduledCells = scheduleRef.current

    return () => {
      for (const cellId of scheduledCells.values()) {
        invalidateScheduledUpgrade(cellId)
      }

      scheduledCells.clear()
    }
  }, [])

  const handleZoomImage = useCallback(
    (
      cellId: string,
      cell: Pick<GridCellLayout, 'width' | 'height'>,
      scaleDelta: number,
      anchor?: { x: number; y: number }
    ) => {
      useEditorStore.getState().zoomImage(cellId, cell, scaleDelta, anchor)
      scheduleUpgradeCheck(cellId, 'zoom', 220)
    },
    [scheduleUpgradeCheck]
  )

  return {
    handleZoomImage,
    prepareImageForCell,
  }
}
