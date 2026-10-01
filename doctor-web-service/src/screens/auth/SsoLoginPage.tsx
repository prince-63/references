import {useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {getSsoLoginDetails} from 'redux/Slices/AuthSlice/loginSlice'
import {getStorageType} from 'utils/storage'
import {userSetup} from 'components/auth/services/userSetup.service'
import {getDeviceDetails, identifyUser} from 'utils/ConstFunctions'
import Spinner from 'components/spinner/Spinner'
import {postApiDataLoginSessionCheck} from 'redux/Slices/AuthSlice/loginSessionCheckSlice'
import {AxiosError} from 'axios'
import {postApiDataLogoutOnSessionCall} from 'redux/Slices/AuthSlice/logoutOnSessionCall'
import {AuthContext} from 'context/AuthContext'
declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView: any
  }
const SsoLoginPage = () => {
  const {loadingSsoLogin} = useSelector((state: RootState) => state.apiLogin)
  const {clearData} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const queryParams = new URLSearchParams(location.search)
  const tokenParam = queryParams.get('token')
  const emailParam = queryParams.get('email')

  useEffect(() => {
    if (tokenParam && emailParam) {
      const postData = {
        data: {
          email: emailParam?.toLocaleLowerCase(),
          fingerPrint: getDeviceDetails().fingerprint,
        },
      }

      dispatchAction(postApiDataLoginSessionCheck(postData) as any)
        .unwrap()
        .then((res: any) => {
          if (!res) {
            const postData = {
              data: {
                device_info_details: getDeviceDetails(),
                email: emailParam?.toLowerCase(),
              },
            }
            dispatchAction(postApiDataLogoutOnSessionCall(postData) as any)
          }
          dispatchAction(getSsoLoginDetails({emailId: emailParam, token: tokenParam}))
            .unwrap()
            .then((res: any) => {
              window?.ReactNativeWebView?.postMessage(JSON.stringify(res))
              getStorageType().setItem('userToken', res?.token)
              userSetup(dispatchAction, res, clearData)
              identifyUser()
            })
        })
        .catch((error: AxiosError) => {
          console.error(error)
        })
    }
  }, [emailParam, tokenParam])

  return (
    <center className='mt-10'>
      <Spinner loading={loadingSsoLogin} />
      Loading...
    </center>
  )
}

export default SsoLoginPage
