import rolesConstants from '@constants/roles.constants'
import {IDoctorProfileDetails} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'

export const getOrgUserRole = (activeProfile: IDoctorProfileDetails | null | undefined) => {
  const isOrganization: boolean =
    activeProfile?.profile_type === 'OWNER' &&
    !!activeProfile?.roles.find(
      (role) =>
        role.name === rolesConstants.ALIGNER_COMPANY_OR_LAB ||
        role.name === rolesConstants.IN_OFFICE_MANUFACTURER
    )

  const isPractice: boolean = activeProfile?.profile_type === 'INVITED'

  const isDisallowedRole = (
    roleName: string
  ): roleName is 'IN_OFFICE_MANUFACTURER' | 'ALIGNER_COMPANY_OR_LAB' => {
    return ['IN_OFFICE_MANUFACTURER', 'ALIGNER_COMPANY_OR_LAB'].includes(roleName)
  }

  const isStarterPlanUser: boolean =
    activeProfile?.profile_type === 'OWNER' &&
    !activeProfile?.roles.some((role) => isDisallowedRole(role.name))

  return {
    isOrganization: isOrganization,
    isPractice: isPractice,
    isStarterPlanUser: isStarterPlanUser,
  }
}
