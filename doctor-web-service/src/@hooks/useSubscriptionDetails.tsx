import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from './useDispatchAction'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useContext, useEffect, useRef} from 'react'
import {AuthContext} from 'context/AuthContext'
import {getSubscriptionDetails} from 'redux/Slices/AppSlice/subscription/subscription.slice'

const useSubscriptionDetails = (getFreshData: boolean = false) => {
  const {dispatchAction} = useDispatchAction()
  const {loadingDataSubscriptionData, subscriptionData} = useSelector(
    (state: RootState) => state.subscription
  )
  const {userId, profileId} = useContext(AuthContext)
  const lastRequestedKey = useRef<string | null>(null)
  const requestKey = `${userId ?? ''}:${profileId ?? ''}`

  useEffect(() => {
    if (!getFreshData || !userId || !profileId) return
    if (lastRequestedKey.current === requestKey) return
    lastRequestedKey.current = requestKey
    dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
  }, [dispatchAction, getFreshData, profileId, requestKey, userId])

  return {loadingSubscriptionData: loadingDataSubscriptionData, subscriptionData}
}

export default useSubscriptionDetails
