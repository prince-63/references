import React, {useContext, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {getStorageType} from 'utils/storage'
import {userSetupForSwitchProfileService} from '../services/userSetupForSwitchProfile.service'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import '../styles/CrossPlatform.css'
import {safeParseInt} from 'utils/ConstFunctions'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'

const CrossPlatform = () => {
  const {clearData, isLoggedIn} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {search} = useLocation()
  const params = new URLSearchParams(search)
  const profileId = params.get('profileId')
  const orgId = params.get('orgId')
  const userId = params.get('userId')
  const userToken = params.get('userToken')

  useEffect(() => {
    if (userToken && profileId && orgId && userId) {
      clearData()
      getStorageType().setItem('userToken', String(userToken))
      const postData = {
        doctor_id: safeParseInt(userId),
      }
      dispatchAction(getApiDataDoctorProfile(postData) as any)
        .unwrap()
        .then(() => {
          userSetupForSwitchProfileService(
            isLoggedIn,
            dispatchAction,
            String(userToken),
            String(userId),
            String(profileId),
            String(orgId)
          )
        })
    }
  }, [userToken, profileId, orgId, userId, clearData, isLoggedIn, dispatchAction])

  return (
    <div className='cross-platform'>
      <div className='cross-platform__message'>
        Please wait, we are redirecting you to your profile...
      </div>
      <div className='cross-platform__spinner' />
    </div>
  )
}

export default CrossPlatform
