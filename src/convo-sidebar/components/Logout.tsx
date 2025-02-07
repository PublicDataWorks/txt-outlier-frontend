import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTokenChanged } from '../providers/auth'
import { ROOT_PATH } from '../constants/routes'

// TODO: remove me
const Logout = () => {
  const navigate = useNavigate()
  const { updateToken } = useTokenChanged()

  useEffect(() => {
    updateToken('')
    navigate(ROOT_PATH, { replace: true })
  }, [])

  return null
}

export default Logout
