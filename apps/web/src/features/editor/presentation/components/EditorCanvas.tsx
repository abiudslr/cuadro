import { useEffect, useRef } from 'react'
import { useEditorStore } from '../../application/editorStore'

export function EditorCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const { rows, columns } = useEditorStore()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width = canvas.clientWidth
        const height = canvas.height = canvas.clientHeight

        ctx.clearRect(0, 0, width, height)

        const cellWidth = width / columns
        const cellHeight = height / rows

        ctx.strokeStyle = '#444'

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                ctx.strokeRect(
                    c * cellWidth,
                    r * cellHeight,
                    cellWidth,
                    cellHeight
                )
            }
        }
    }, [rows, columns])

    return (
        <canvas
            ref={canvasRef}
            style={{ flex: 1, width: '100%', height: '100%' }}
        />
    )
}