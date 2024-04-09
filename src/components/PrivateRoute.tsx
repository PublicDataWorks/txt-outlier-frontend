import { type FC, type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToken, useTokenChanged } from '../providers/auth'
import { LOGIN_PATH } from '../constants/routes'
import PropTypes from 'prop-types'
import { InvalidTokenError, jwtDecode } from 'jwt-decode'

interface PrivateRouteProperties {
  children: ReactNode
}

const PrivateRoute: FC<PrivateRouteProperties> = ({ children }) => {
  const { token } = useToken()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const { updateToken } = useTokenChanged()

  useEffect(() => {
    if (typeof token !== 'undefined') {
      if (!token) navigate(LOGIN_PATH)
      else {
        try {
          const decoded = jwtDecode(token)
          if (decoded.exp * 1000 <= Date.now()) {
            Missive.storeSet('token', '')
            updateToken('')
            navigate(LOGIN_PATH)
          } else {
            setIsLoading(false)
          }
        } catch (error) {
          if (error instanceof InvalidTokenError) {
            Missive.storeSet('token', '')
            updateToken('')
            navigate(LOGIN_PATH)
          }
        }
      }
    }
  }, [token])

  if (isLoading) {
    return <b>Loading...</b>
  }
  return children
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default PrivateRoute
