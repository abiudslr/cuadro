import '@/app/styles/global.css'
import { AppProviders } from '@/app/providers/AppProviders'
import { EditorPage } from '@/features/editor/presentation/pages/EditorPage'

export function App() {
  return (
    <AppProviders>
      <EditorPage />
    </AppProviders>
  )
}
