import {useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import {getSubscriptionDetails} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import useActiveProfile from './useActiveProfile'
import {IDoctorProfileDetails} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import rolesConstants from '@constants/roles.constants'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from './useDispatchAction'

export const hasRole = (
  activeProfile: IDoctorProfileDetails | null | undefined,
  roleName: string
): boolean => !!activeProfile?.roles.some((role) => role.name === roleName)

const useAllUserPlan = (getFreshData: boolean = false) => {
  const {dispatchAction} = useDispatchAction()
  const {activeProfile} = useActiveProfile()
  const {subscriptionData} = useSelector((state: RootState) => state.subscription)
  const {userId} = useContext(AuthContext)

  const planName = subscriptionData?.plan_metadata?.plan_name
  const profileType = activeProfile?.profile_type

  // ✅ memoize computed booleans (no re-computation on every render)
  const values = useMemo(() => {
    const isOwner = profileType === 'OWNER'
    const isEnterpriseOwnerRole =
      profileType === 'OWNER' &&
      (hasRole(activeProfile, rolesConstants.ENTERPRISE_COMPANY_LAB) ||
        hasRole(activeProfile, rolesConstants.ALIGNER_COMPANY_OR_LAB))
    const isGrowthOwnerRole =
      profileType === 'OWNER' && hasRole(activeProfile, rolesConstants.IN_OFFICE_MANUFACTURER)

    const isEnterprisePlanUser =
      (planName === 'ENTERPRISE' && isEnterpriseOwnerRole) ||
      (planName === 'ENTERPRISE' && activeProfile?.subrole_name === 'ADMIN')

    const isProfessionalPlanUser =
      (planName === 'PROFESSIONAL' && profileType === 'OWNER') ||
      (planName === 'PROFESSIONAL' && activeProfile?.subrole_name === 'ADMIN')

    const isAlignerCompanyOrg =
      ((planName === 'PROFESSIONAL' || planName === 'ENTERPRISE') && profileType === 'OWNER') ||
      ((planName === 'ENTERPRISE' || planName === 'PROFESSIONAL') &&
        activeProfile?.subrole_name === 'ADMIN')

    const isDesignLabUser =
      (planName === 'DESIGN_LAB' && profileType === 'OWNER') ||
      (planName === 'DESIGN_LAB' &&
        profileType === 'INVITED' &&
        hasRole(activeProfile, rolesConstants.INTERNAL_USER))

    const isGrowthPlanUser =
      (planName === 'GROWTH' && isGrowthOwnerRole) ||
      (planName === 'GROWTH' && activeProfile?.subrole_name === 'ADMIN')

    const isStarterPlanUser =
      (planName === 'STARTER' || planName === 'LITE') &&
      profileType === 'OWNER' &&
      (hasRole(activeProfile, rolesConstants.CLINIC_OWNER) ||
        hasRole(activeProfile, rolesConstants.CONSULTING_ORTHODONTIST))

    const isLitePlanUser =
      planName === 'LITE' &&
      profileType === 'OWNER' &&
      (hasRole(activeProfile, rolesConstants.CLINIC_OWNER) ||
        hasRole(activeProfile, rolesConstants.CONSULTING_ORTHODONTIST))

    const isEnterpriseLabAdmin =
      planName === 'ENTERPRISE' &&
      isEnterpriseOwnerRole &&
      hasRole(activeProfile, rolesConstants.VENDOR)

    const isEnterpriseVendor =
      planName === 'ENTERPRISE' &&
      profileType === 'INVITED' &&
      hasRole(activeProfile, rolesConstants.VENDOR)

    const isEnterpriseCustomer =
      planName === 'ENTERPRISE' &&
      profileType === 'INVITED' &&
      hasRole(activeProfile, rolesConstants.CUSTOMER)

    const isPractice =
      profileType === 'INVITED' && hasRole(activeProfile, rolesConstants.CONSULTING_ORTHODONTIST)
    const isCustomer = profileType === 'INVITED' && hasRole(activeProfile, rolesConstants.CUSTOMER)
    const isVendor = profileType === 'INVITED' && hasRole(activeProfile, rolesConstants.VENDOR)
    const isInternalUser =
      profileType === 'INVITED' && hasRole(activeProfile, rolesConstants.INTERNAL_USER)

    const isAdmin = activeProfile?.subrole_name === 'ADMIN'
    const isProductionUser =
      activeProfile?.subrole_name === 'Production' || activeProfile?.subrole_name === 'ADMIN'

    const isOrganization = isEnterprisePlanUser || isProfessionalPlanUser

    return {
      isEnterprisePlanUser,
      isProfessionalPlanUser,
      isAlignerCompanyOrg,
      isDesignLabUser,
      isGrowthPlanUser,
      isStarterPlanUser,
      isEnterpriseLabAdmin,
      isEnterpriseVendor,
      isEnterpriseCustomer,
      isOrganization,
      isPractice,
      isCustomer,
      isVendor,
      isInternalUser,
      isOwner,
      isLitePlanUser,
      isAdmin,
      isProductionUser,
    }
  }, [planName, profileType, activeProfile])

  useEffect(() => {
    if (!getFreshData) return
    dispatchAction(
      getSubscriptionDetails({
        doctor_id: safeParseInt(userId),
      })
    )
  }, [dispatchAction, getFreshData, userId])

  return values
}

export default useAllUserPlan
