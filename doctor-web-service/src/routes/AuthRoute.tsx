import {useEffect} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {Registration} from '../components/auth/components/Registration'
import {Login} from '../components/auth/components/Login'
import {AuthLayout} from '../components/auth/layout/AuthLayout'
import {Route, Routes} from 'react-router-dom'
import Notfound from 'components/errorHandler/Notfound'
import HealthCheck from './HealthCheck'
import SelectRolePage from 'screens/auth/SelectRolePage'
import ConnectWithOrgPage from 'screens/auth/ConnectWithOrgPage'
import SsoLoginPage from 'screens/auth/SsoLoginPage'
import CrossPlatform from 'components/auth/components/CrossPlatform'

const AuthRoute = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {search} = useLocation()
  const params = new URLSearchParams(search)
  const profileId = params.get('profileId')

  useEffect(() => {
    const handlePopState = () => {
      const allowedPaths = ['/login', '/', '/registration', '/roles']
      const isConnectRoute = location.pathname.match(/^\/[^/]+\/connect$/)
      const isCrossPlatform = location.pathname === '/cross-platform'
      const isSsoLoginRoute = location.pathname === '/redirect'

      if (
        !allowedPaths.includes(location.pathname) &&
        !isConnectRoute &&
        !isSsoLoginRoute &&
        !isCrossPlatform &&
        !profileId
      ) {
        navigate('/', {
          replace: true,
        })
      }
    }
    handlePopState()
  }, [location.pathname, navigate, profileId])

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path='login/*' element={<Login />} />
        <Route path='/registration' element={<Registration />} />
        <Route index element={<Login />} />
        <Route path='/:inviteId/connect' element={<ConnectWithOrgPage />} />
        <Route path='/cross-platform' element={<CrossPlatform />} />
        <Route path='/redirect' element={<SsoLoginPage />} />
      </Route>
      <Route path='/roles' element={<SelectRolePage />} />
      <Route path='*' element={<Notfound />} />
      <Route path='health' element={<HealthCheck />} />
    </Routes>
  )
}

export {AuthRoute}
