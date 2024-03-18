import type { ReactElement } from 'react'
import { Route, HashRouter as Router, Routes } from 'react-router-dom'
import { LOGIN_PATH, LOGOUT_PATH } from './constants/routes'
import GoogleOauthPopup from './components/GoogleOauthPopup'
import Logout from './components/Logout'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App(): ReactElement {
  return (
    <>
      <Router>
        <Routes>
          <Route
            path={LOGIN_PATH}
            element={
              <div className='flex h-screen items-center justify-center'>
                <GoogleOauthPopup />
              </div>
            }
          />
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
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
