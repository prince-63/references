import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'

const ClearLocalStorageAndReload = () => {
  const navigate = useNavigate()
  const {logout} = useContext(AuthContext)
  const location = useLocation()

  useEffect(() => {
    logout()
    navigate(location.pathname)
  }, [navigate])

  return null
}

export default ClearLocalStorageAndReload
