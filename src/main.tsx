// Import all dependencies
import App from 'App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.scss'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthProvider from './providers/auth'
import WebsocketProvider from './providers/ws'

async function importDevStylesheet() {
  if (import.meta.env.DEV) {
    await import('./App.dev.scss')
  }
}

function createAndRenderApp(container: Element | null) {
  if (container) {
    const queryClient = new QueryClient()
    const root = createRoot(container)
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <WebsocketProvider>
              <App />
            </WebsocketProvider>
          </AuthProvider>
        </QueryClientProvider>
      </StrictMode>
    )
  }
}

void importDevStylesheet()
createAndRenderApp(document.querySelector('#root'))
