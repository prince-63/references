import Page from 'components/page/Page'
import {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ContainerWrapper from '../components/ContainerWrapper'
import InfoIcon from 'assets/icons/InfoIcon'
import ProfileItem from './ProfileItem'
import useDispatchAction from '@hooks/useDispatchAction'
import {getProfileManagementData} from 'redux/Slices/AppSlice/settings/settings.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import AddProfile from 'components/menu/AddProfile'
import rolesConstants from '@constants/roles.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ProfileManagementPage = () => {
  const {dispatchAction} = useDispatchAction()
  const {loadingProfileManagementData, profiles} = useSelector((state: RootState) => state.settings)
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const {userId, organizationId} = useContext(AuthContext)
  const profileList = doctorData?.profiles
  const AllRoles = [
    rolesConstants.ALIGNER_COMPANY_OR_LAB,
    rolesConstants.CLINIC_OWNER,
    rolesConstants.COMMERCIAL_ALIGNER_LAB,
    rolesConstants.CONSULTING_ORTHODONTIST,
    rolesConstants.IN_OFFICE_MANUFACTURER,
  ]
  const presentDoctorRolesList = profileList?.flatMap((item) =>
    (item?.roles ?? []).map((role) => role.name)
  )
  const hasAllRoles = AllRoles.every((role) => presentDoctorRolesList.includes(role))

  useEffect(() => {
    dispatchAction(
      getProfileManagementData({
        doctorId: safeParseInt(userId),
        organizationId: safeParseInt(organizationId),
      })
    )
  }, [])

  const [isPopoverVisible, setIsPopoverVisible] = useState<number | null>(null)
  const [openAddProfile, setOpenAddProfile] = useState<boolean>(false)
  const userRoleInfo = useAllUserPlan()

  return (
    <Page loading={loadingProfileManagementData}>
      <AddProfile openAddProfile={openAddProfile} setOpenAddProfile={setOpenAddProfile} />
      <div className='md:w-3/4'>
        <ContainerWrapper
          title='Your profiles'
          subTitle='All profiles linked to your email are listed. The default profile opens at login and can be updated anytime.'
          buttonText={''}
          onClickButton={() => {
            setOpenAddProfile(true)
          }}
          extraButtonDisable={hasAllRoles}
        >
          <div className='flex flex-col gap-6'>
            <div>
              <div className='flex gap-2 text-textColor text-sm font-medium items-center'>
                <InfoIcon />
                <p>
                  Showing profiles linked to{' '}
                  <span className='text-black '>{doctorData?.email}</span>
                </p>
              </div>
            </div>
            <div className='flex flex-col gap-5'>
              {profiles?.map((profile) => {
                const doctorProfile = doctorData.profiles?.find(
                  (p) => p.profile_id === profile.profile_id
                )
                const subscriptionPlanName =
                  doctorData.subscriptions.find((sub) => sub.profile_id === profile.profile_id)
                    ?.plan_metadata?.plan_name ?? ''

                return (
                  <ProfileItem
                    key={profile.profile_id}
                    profile={profile}
                    userRoleInfo={doctorProfile ? userRoleInfo : {}} // ✅ safe usage
                    subscriptionPlanName={subscriptionPlanName}
                    ownerOrgName={doctorProfile?.owner_organization_name || ''}
                    {...{
                      isPopoverVisible,
                      setIsPopoverVisible,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </ContainerWrapper>
      </div>
    </Page>
  )
}

export default ProfileManagementPage
