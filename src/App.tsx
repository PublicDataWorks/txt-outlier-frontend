import type { ReactElement } from 'react'
import { Route, HashRouter as Router, Routes } from 'react-router-dom'
import AuthProvider from './providers/auth'
import { LOGIN_PATH, LOGOUT_PATH } from './constants/routes'
import GoogleOauthPopup from './components/GoogleOauthPopup'
import Logout from './components/Logout'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'

const queryClient = new QueryClient()
const supabase = createClient(
  '',
  ''
)
// Create a function to handle inserts
const handleInserts = payload => {
  console.log('Change received!', payload)
}

// Listen to inserts
supabase
  .channel('comments')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, handleInserts)
  .subscribe()

export default function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path={LOGIN_PATH} element={<GoogleOauthPopup />} />
            <Route path={LOGOUT_PATH} element={<Logout />} />
            <Route
              path='*'
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
