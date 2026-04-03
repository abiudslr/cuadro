import { useEditorStore } from '../../application/editorStore'

export function Toolbar() {
    const { rows, columns, setRows, setColumns } = useEditorStore()

    return (
        <div style={{
            padding: 12,
            display: 'flex',
            gap: 8,
            background: '#1a1a1c'
        }}>
            <button onClick={() => setRows(rows + 1)}>Rows +</button>
            <button onClick={() => setRows(Math.max(1, rows - 1))}>Rows -</button>

            <button onClick={() => setColumns(columns + 1)}>Cols +</button>
            <button onClick={() => setColumns(Math.max(1, columns - 1))}>Cols -</button>
        </div>
    )
}