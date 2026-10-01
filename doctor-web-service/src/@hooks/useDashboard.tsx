import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from './useDispatchAction'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useContext, useEffect, useRef} from 'react'
import {AuthContext} from 'context/AuthContext'
import {getDashboardNewDetails} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import useActiveProfile from './useActiveProfile'
import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import {
  getSubscriptionDetails,
  planUpgrade,
} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import rolesConstants from '@constants/roles.constants'
import useAllUserPlan from './useAllUserPlan'

export type DisplayRole =
  | 'STARTER'
  | 'GROWTH'
  | 'PROFESSIONAL'
  | 'ENTERPRISE'
  | 'VENDOR'
  | 'CUSTOMER'
  | 'PRACTICE_CONNECTED_ORG'
  | 'DESIGN_LAB'
  | 'LAB_STAFF'
  | 'UNKNOWN'
  | 'INTERNAL_USER'

interface ActiveProfile {
  profile_type: 'INVITED' | 'OWNER' | string
}

export const getDisplayRole = (role: string[] = [], activeProfile: ActiveProfile): DisplayRole => {
  const mainRole = role[0]?.toUpperCase()

  const tierRoles = ['STARTER', 'GROWTH', 'PROFESSIONAL', 'ENTERPRISE']

  if (tierRoles.includes(mainRole)) {
    return mainRole as DisplayRole
  }

  if (activeProfile.profile_type === 'INVITED') {
    switch (mainRole) {
      case 'VENDOR':
        return 'VENDOR'
      case 'CUSTOMER':
        return 'CUSTOMER'
      case 'CONSULTING_ORTHODONTIST':
        return 'PRACTICE_CONNECTED_ORG'
      case 'LAB_STAFF':
        return 'LAB_STAFF'
      case 'INTERNAL_USER':
        return 'INTERNAL_USER'
    }
  }

  if (
    (activeProfile.profile_type === 'OWNER' &&
      mainRole === rolesConstants.COMMERCIAL_ALIGNER_LAB) ||
    mainRole === 'DESIGN_LAB'
  ) {
    return 'DESIGN_LAB'
  }

  return 'UNKNOWN'
}

const useDashboard = (getFreshData: boolean = false) => {
  const {dispatchAction} = useDispatchAction()
  const {loadingDashboard, loadingNewDashboard, dashboard} = useSelector(
    (state: RootState) => state.DoctorDashboard
  )
  const {subscriptionData, loadingDataSubscriptionData} = useSelector(
    (state: RootState) => state.subscription
  )
  const {newDashboard} = useSelector((state: RootState) => state.DoctorDashboard)
  const {isPractice} = useAllUserPlan()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {userId, profileId} = useContext(AuthContext)
  const {activeProfile} = useActiveProfile()
  const role = (activeProfile?.roles ?? []).map((role) => role.name)
  const userRole = getDisplayRole(role, activeProfile ?? {})
  const {logout} = useContext(AuthContext)
  const lastRequestedSubscriptionKey = useRef<string | null>(null)
  const lastDashboardKey = useRef<string | null>(null)
  const hasTriggeredDashboard = useRef(false)
  const hasHandledPlanUpgrade = useRef(false)
  const requestKey = `${userId ?? ''}:${profileId ?? ''}`

  useEffect(() => {
    hasTriggeredDashboard.current = false
    hasHandledPlanUpgrade.current = false
  }, [requestKey])

  useEffect(() => {
    if (!getFreshData || !userId || !profileId) return
    if (lastRequestedSubscriptionKey.current === requestKey) return
    lastRequestedSubscriptionKey.current = requestKey
    dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
  }, [dispatchAction, getFreshData, profileId, requestKey, userId])

  useEffect(() => {
    if (!getFreshData) return
    const planMetadata = (subscriptionData as ISubscriptionDetails)?.plan_metadata
    if (!planMetadata) return
    if (hasTriggeredDashboard.current) return

    const getComputedPlanName = (userRole: string, plan_name?: string, isVsp?: boolean): string => {
      if (isVsp) {
        return 'PRACTICE_CONNECTED_TO_VSP_ORG'
      }
      if (userRole === 'INTERNAL_USER') {
        return userRole
      }

      if (userRole === 'UNKNOWN') {
        return planMetadata?.plan_name ?? ''
      }

      if (userRole === 'LAB_STAFF' && plan_name === 'ENTERPRISE') {
        return 'ENTERPRISE_LAB_STAFF'
      }
      return userRole
    }

    const dashboardKey = `${requestKey}:${planMetadata?.plan_name ?? ''}:${userRole}:${String(
      serviceConfig.VSP_PLANNING && isPractice
    )}`
    if (lastDashboardKey.current === dashboardKey) return
    lastDashboardKey.current = dashboardKey
    hasTriggeredDashboard.current = true
    dispatchAction(
      getDashboardNewDetails({
        doctor_id: safeParseInt(userId),
        roles: role,
        plan_name: getComputedPlanName(
          userRole,
          planMetadata?.plan_name ?? '',
          serviceConfig.VSP_PLANNING && isPractice
        ),
      })
    )

    try {
      if ((window as any).ReactNativeWebView) {
        ;(window as any).ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'PLAN_NAME',
            plan_name: getComputedPlanName(
              userRole,
              planMetadata?.plan_name ?? '',
              serviceConfig.VSP_PLANNING && isPractice
            ),
          })
        )
      }
    } catch {
      // ignore if not in WebView
    }
  }, [dispatchAction, getFreshData, role, subscriptionData, userId, userRole])

  useEffect(() => {
    if (!getFreshData) return
    const subscription = subscriptionData as ISubscriptionDetails
    if (!subscription?.is_plan_upgraded) return
    if (hasHandledPlanUpgrade.current) return

    hasHandledPlanUpgrade.current = true
    dispatchAction(planUpgrade({user_profile_id: safeParseInt(profileId)}))
      .unwrap()
      .then(() => {
        logout()
      })
  }, [dispatchAction, getFreshData, logout, profileId, subscriptionData])
  // Expose both legacy and v4 loading flags; spread legacy and new dashboard payloads
  return {loadingDashboard, loadingNewDashboard, ...dashboard, ...newDashboard}
}

export default useDashboard
