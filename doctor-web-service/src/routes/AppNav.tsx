// AppNav.js
import {memo, useContext} from 'react'
import {AuthContext} from '../context/AuthContext'
import {PrivateRoutes} from './PrivateRoutes'
import {AuthRoute} from './AuthRoute'
import hasValue from '../utils/hasValue'
import {getStorageType} from 'utils/storage'

function AppNav() {
  const {isLoading} = useContext(AuthContext)

  const userToken1 = getStorageType().getItem('userToken')

  if (isLoading) {
    return (
      <div className='flex flex-1 justify-center items-center'>
        <div>Loading...</div>
      </div>
    )
  } else {
    return !hasValue(userToken1) ? <AuthRoute /> : <PrivateRoutes />
  }
}

export default memo(AppNav)
