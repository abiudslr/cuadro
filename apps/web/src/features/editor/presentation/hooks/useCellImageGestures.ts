import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import type { CellViewport, ZoomAnchor } from '../../domain/cellImageTransform'

type Point = ZoomAnchor

type UseCellImageGesturesInput = {
  cellId: string
  cell: CellViewport
  enabled: boolean
  onSelect: (cellId: string) => void
  onPan: (cellId: string, cell: CellViewport, deltaX: number, deltaY: number) => void
  onZoom: (
    cellId: string,
    cell: CellViewport,
    scaleDelta: number,
    anchor?: ZoomAnchor
  ) => void
}

function getDistance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

function getCenter(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  }
}

function getRelativePoint(
  event: ReactPointerEvent<HTMLElement> | ReactWheelEvent<HTMLElement>
): Point {
  const rect = event.currentTarget.getBoundingClientRect()

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

export function useCellImageGestures({
  cellId,
  cell,
  enabled,
  onSelect,
  onPan,
  onZoom,
}: UseCellImageGesturesInput) {
  const pointersRef = useRef(new Map<number, Point>())
  const pinchStateRef = useRef<{ center: Point; distance: number } | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const queuedPanRef = useRef({ x: 0, y: 0 })
  const queuedZoomRef = useRef<{ scaleDelta: number; anchor?: ZoomAnchor }>({
    scaleDelta: 1,
  })
  const [isDragging, setIsDragging] = useState(false)

  const flushQueuedGestures = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }

    const queuedPan = queuedPanRef.current
    const queuedZoom = queuedZoomRef.current

    queuedPanRef.current = { x: 0, y: 0 }
    queuedZoomRef.current = { scaleDelta: 1 }

    if (queuedPan.x !== 0 || queuedPan.y !== 0) {
      onPan(cellId, cell, queuedPan.x, queuedPan.y)
    }

    if (queuedZoom.scaleDelta !== 1) {
      onZoom(cellId, cell, queuedZoom.scaleDelta, queuedZoom.anchor)
    }
  }, [cell, cellId, onPan, onZoom])

  const scheduleGestureFlush = useCallback(() => {
    if (rafIdRef.current !== null) {
      return
    }

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null
      flushQueuedGestures()
    })
  }, [flushQueuedGestures])

  const queuePan = useCallback((deltaX: number, deltaY: number) => {
    queuedPanRef.current = {
      x: queuedPanRef.current.x + deltaX,
      y: queuedPanRef.current.y + deltaY,
    }
    scheduleGestureFlush()
  }, [scheduleGestureFlush])

  const queueZoom = useCallback((scaleDelta: number, anchor?: ZoomAnchor) => {
    queuedZoomRef.current = {
      scaleDelta: queuedZoomRef.current.scaleDelta * scaleDelta,
      anchor,
    }
    scheduleGestureFlush()
  }, [scheduleGestureFlush])

  const resetGestureState = () => {
    const pointers = [...pointersRef.current.values()]

    if (pointers.length === 1) {
      pinchStateRef.current = null
      return
    }

    if (pointers.length < 2) {
      pinchStateRef.current = null
      setIsDragging(false)
    }
  }

  useEffect(() => {
    return () => {
      flushQueuedGestures()
    }
  }, [flushQueuedGestures])

  const handlers = useMemo(
    () => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (!enabled) {
          return
        }

        if (event.pointerType === 'mouse' && event.button !== 0) {
          return
        }

        onSelect(cellId)

        const point = getRelativePoint(event)
        pointersRef.current.set(event.pointerId, point)
        event.currentTarget.setPointerCapture(event.pointerId)

        if (pointersRef.current.size === 1) {
          setIsDragging(true)
          return
        }

        if (pointersRef.current.size === 2) {
          const [first, second] = [...pointersRef.current.values()]
          pinchStateRef.current = {
            center: getCenter(first, second),
            distance: getDistance(first, second),
          }
          setIsDragging(false)
        }
      },
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        if (!enabled || !pointersRef.current.has(event.pointerId)) {
          return
        }

        const nextPoint = getRelativePoint(event)
        const previousPoint = pointersRef.current.get(event.pointerId)

        if (!previousPoint) {
          return
        }

        pointersRef.current.set(event.pointerId, nextPoint)

        if (pointersRef.current.size === 1) {
          queuePan(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y)
          setIsDragging(true)
          return
        }

        if (pointersRef.current.size === 2) {
          const [first, second] = [...pointersRef.current.values()]
          const nextCenter = getCenter(first, second)
          const nextDistance = getDistance(first, second)
          const previousPinchState = pinchStateRef.current

          if (previousPinchState && previousPinchState.distance > 0 && nextDistance > 0) {
            queuePan(
              nextCenter.x - previousPinchState.center.x,
              nextCenter.y - previousPinchState.center.y
            )
            queueZoom(nextDistance / previousPinchState.distance, nextCenter)
          }

          pinchStateRef.current = {
            center: nextCenter,
            distance: nextDistance,
          }
          setIsDragging(false)
        }
      },
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }

        pointersRef.current.delete(event.pointerId)
        resetGestureState()
        flushQueuedGestures()
      },
      onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }

        pointersRef.current.delete(event.pointerId)
        resetGestureState()
        flushQueuedGestures()
      },
      onWheel: (event: ReactWheelEvent<HTMLElement>) => {
        if (!enabled) {
          return
        }

        event.preventDefault()
        onSelect(cellId)

        const point = getRelativePoint(event)
        const scaleDelta = Math.min(Math.max(Math.exp(-event.deltaY * 0.0015), 0.85), 1.2)

        queueZoom(scaleDelta, point)
      },
    }),
    [cellId, enabled, flushQueuedGestures, onSelect, queuePan, queueZoom]
  )

  return {
    ...handlers,
    isDragging,
  }
}
