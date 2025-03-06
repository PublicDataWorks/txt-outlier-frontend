import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { LOGIN_PATH } from '../constants/routes';
import { useToken, useTokenChanged } from '../providers/auth';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token } = useToken();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { updateToken } = useTokenChanged();
  const location = useLocation();

  const saveLocationAndNavigateToLogin = () => {
    const queryParams = new URLSearchParams({
      next: location.pathname,
  }).toString();

    navigate(`${LOGIN_PATH}?${queryParams}`);
  };

  useEffect(() => {
    if (typeof token !== 'undefined') {
      if (!token) saveLocationAndNavigateToLogin();
      else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
            localStorage.setItem('token', '');
            updateToken('');
            saveLocationAndNavigateToLogin();
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          if (error instanceof InvalidTokenError) {
            localStorage.setItem('token', '');
            updateToken('');
            saveLocationAndNavigateToLogin();
          }
        }
      }
    }
  }, [token]);

  if (isLoading) {
    return <b>Loading...</b>;
  }
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
