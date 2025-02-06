import type { ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LOGIN_PATH, LOGOUT_PATH } from './constants/routes';
import GoogleOauthPopup from './components/GoogleOauthPopup';
import Logout from './components/Logout';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';

export default function Abc(): ReactElement {
  return (
    <Routes>
      {/* Define sub-routes under /convo-sidebar*/}
      <Route path={LOGIN_PATH} element={<GoogleOauthPopup />} />
      <Route path={LOGOUT_PATH} element={<Logout />} />
      <Route
        path="*"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
