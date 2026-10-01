import {useEffect} from 'react'
import {Outlet} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {redirectLoginGoogleData} from '../services/redirectGoogleData.service'
import {redirectLoginAppleData} from '../services/redirectAppleData.service'
import {getStorageType} from 'utils/storage'

const AuthLayout = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (getStorageType().getItem('googleLoginDataLoader') === 'true') {
      redirectLoginGoogleData(dispatch)
    } else if (getStorageType().getItem('appleLoginDataLoader') === 'true') {
      redirectLoginAppleData(dispatch)
    }
  }, [])

  return (
    <div className='flex justify-center items-center min-h-screen p-6 md:p-0'>
      <div className='w-full md:w-1/2 flex items-center justify-center'>
        <div className='w-full md:w-5/6 lg:w-2/3 xl:w-1/2'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export {AuthLayout}
