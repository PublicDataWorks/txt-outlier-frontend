import { createContext, useContext, useMemo } from 'react'
import type { JwtPayload } from 'jwt-decode'
import { jwtDecode } from 'jwt-decode'
import PropTypes from 'prop-types'
import { useToken } from './auth'

interface AppMetadata extends JwtPayload {
  app_metadata?: {
    anon_key: string
    provider: string
    providers: string[]
  }
}

interface AnonKeyContextValue {
  anonKey: string | undefined
}

const AnonKeyContext = createContext<AnonKeyContextValue>({} as AnonKeyContextValue)

interface WebsocketProperties {
  children: React.ReactNode
}

function WebsocketProvider({ children }: WebsocketProperties) {
  let { token } = useToken()
  if (import.meta.env.DEV) {
    token = import.meta.env.VITE_JWT_TOKEN as string
  }
  const decodedToken = token ? jwtDecode<AppMetadata>(token) : undefined
  const anonKey = decodedToken ? decodedToken.app_metadata?.anon_key : undefined

  const anonKeyValue = useMemo(() => ({ anonKey }), [anonKey])

  return <AnonKeyContext.Provider value={anonKeyValue}>{children}</AnonKeyContext.Provider>
}

WebsocketProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export function useAnonKey() {
  return useContext(AnonKeyContext)
}

export default WebsocketProvider
