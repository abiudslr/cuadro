import { EditorCanvas } from '../components/EditorCanvas'
import { Toolbar } from '../components/Toolbar'

export function EditorPage() {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <EditorCanvas />
            <Toolbar />
        </div>
    )
}