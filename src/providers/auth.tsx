import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import axios from '../lib/axios'

interface TokenContextValue {
  token: string | undefined
}

interface TokenChangedValue {
  updateToken: (token: string) => void
}

const TokenContext = createContext<TokenContextValue>({} as TokenContextValue)
const TokenChangedContext = createContext<TokenChangedValue>({} as TokenChangedValue)

interface AuthProviderProperties {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProperties) {
  const [token, setToken] = useState<string>()
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>()

  const updateToken = useCallback((accessToken: string | null) => {
    if (!token && accessToken) {
      // Login
      const newIntervalId = setInterval(() => {
        Missive.fetchOrganizations().then(orgs => {
          if (!orgs[0]) return
          const teamIds =
            orgs[0].teams.filter(team => team.users.find(user => user.me)).map(team => team.id)
          axios.defaults.headers.common['X-Teams'] = teamIds.join(', ')
          // eslint-disable-next-line no-console
        }).catch(console.error)
      }, 10000)
      setIntervalId(newIntervalId)
    } else if (token && !accessToken) {
      // Logout
      clearInterval(intervalId)
      setIntervalId(undefined)
      axios.defaults.headers.common['X-Teams'] = undefined
    }

    let authHeader = ''
    if (accessToken) {
      authHeader = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`
    }
    axios.defaults.headers.common.Authorization = authHeader
    Missive.storeSet('token', authHeader)
    setToken(authHeader)
  }, [])

  useEffect(() => {
    if (import.meta.env.DEV) {
      updateToken(import.meta.env.VITE_JWT_TOKEN as string)
    } else {
      void Missive.storeGet<string>('token').then((accessToken: string) => {
        updateToken(accessToken)
      })
    }
  }, [])

  const tokenContextValue = useMemo(() => ({ token }), [token])

  const tokenChangedContextValue = useMemo(() => ({ updateToken }), [updateToken])

  return (
    <TokenChangedContext.Provider value={tokenChangedContextValue}>
      <TokenContext.Provider value={tokenContextValue}>{children}</TokenContext.Provider>
    </TokenChangedContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export const useToken = () => useContext(TokenContext)
export const useTokenChanged = () => useContext(TokenChangedContext)

export default AuthProvider
