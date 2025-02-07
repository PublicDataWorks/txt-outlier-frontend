import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import axios from '../lib/axios';
import broadCastAxios from '../../lib/axios.ts'
import type { ReactNode } from 'react';

interface TokenContextValue {
  token: string | undefined
}

interface TokenChangedValue {
  updateToken: (token: string) => void
}

const TokenContext = createContext<TokenContextValue>({} as TokenContextValue);
const TokenChangedContext = createContext<TokenChangedValue>({} as TokenChangedValue);

interface AuthProviderProperties {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProperties) {
  const [token, setToken] = useState<string>();

  const updateToken = useCallback((accessToken: string | null) => {
    let authHeader = '';
    if (accessToken) {
      authHeader = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
    }

    axios.defaults.headers.common.Authorization = authHeader;
    broadCastAxios.defaults.headers.common.Authorization = authHeader;

    localStorage.setItem('token', authHeader);
    setToken(authHeader);
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem('token');
    updateToken(accessToken);
  }, []);

  const tokenContextValue = useMemo(() => ({ token }), [token]);

  const tokenChangedContextValue = useMemo(() => ({ updateToken }), [updateToken]);

  return (
    <TokenChangedContext.Provider value={tokenChangedContextValue}>
      <TokenContext.Provider value={tokenContextValue}>{children}</TokenContext.Provider>
    </TokenChangedContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useToken = () => useContext(TokenContext);
export const useTokenChanged = () => useContext(TokenChangedContext);

export default AuthProvider;
