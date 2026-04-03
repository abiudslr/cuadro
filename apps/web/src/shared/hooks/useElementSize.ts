import { useEffect, useRef, useState } from 'react'

type ElementSize = {
  width: number
  height: number
}

export function useElementSize<T extends HTMLElement>() {
  const elementRef = useRef<T | null>(null)
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

  useEffect(() => {
    const node = elementRef.current

    if (!node) {
      return
    }

    const updateSize = () => {
      const nextWidth = node.clientWidth
      const nextHeight = node.clientHeight

      setSize((currentSize) => {
        if (
          currentSize.width === nextWidth &&
          currentSize.height === nextHeight
        ) {
          return currentSize
        }

        return { width: nextWidth, height: nextHeight }
      })
    }

    updateSize()

    const resizeObserver = new ResizeObserver(() => {
      updateSize()
    })

    resizeObserver.observe(node)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return { elementRef, size }
}
