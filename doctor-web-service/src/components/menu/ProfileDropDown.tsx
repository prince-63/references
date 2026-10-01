import {useContext} from 'react'
import Profile from './Profile'
import SignOutIcon from 'assets/icons/SignOutIcon'
import UserCircleIcon from 'assets/icons/UserCircleIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {setIsMobileSidebarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import {useNavigate} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import useActiveProfile from '@hooks/useActiveProfile'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import brandNamesConstants from '@constants/brandNames.constants'
import isTrialPlanAboutToExpire from '@utils/isTrialPlanAboutToExpire'
import apiHelper from '@utils/apiHelper'
import {URL_GET_SUBSCRIPTION} from 'redux/Endpoints/apiEndpoints'
import HttpMethod from '@constants/httpMethods.constants'
import isPlanAboutToExpire from '@utils/isPlanAboutToExpire'
const brand = process.env.REACT_APP_BRAND_NAME || brandNamesConstants.DENTALSTACK
import {getStorageType} from 'utils/storage'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {navigateToPortal} from '@utils/getPortalUrlByOrganization'
import {getPlanDisplayName} from 'utils/subscriptionPlan'

const ProfileDropDown = ({
  setOpenCollapsed,
}: {
  setOpenCollapsed: (value: boolean) => void
  setOpenAddProfile: (value: boolean) => void
}) => {
  const {logout, userToken, clearData} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {activeProfile} = useActiveProfile()
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false

  const switchProfile = (
    userId: number,
    profileId: number,
    orgId: number,
    organizationName?: string | null
  ) => {
    if (profileId === activeProfile?.profile_id) return

    if (organizationName && organizationName !== activeProfile?.org_name) {
      clearData()
      const portalUrl = navigateToPortal(organizationName)
      const url = `${portalUrl}/cross-platform?userId=${encodeURIComponent(
        userId ?? ''
      )}&profileId=${encodeURIComponent(profileId)}&orgId=${encodeURIComponent(
        orgId ?? ''
      )}&userToken=${encodeURIComponent(userToken ?? '')}`
      window.location.replace(url)
    } else {
      // Same portal - update storage and reload
      getStorageType().setItem('profileId', String(profileId))
      getStorageType().setItem('organizationId', String(orgId))
      window.location.href = '/'
    }
  }

  const navigate = useNavigate()

  return (
    <div className='w-[300px] py-2 flex flex-col gap-2  text-sm '>
      <div className=' flex flex-col gap-2 px-3'>
        <p className='text-textColor from-mediumGray text-sm'>
          {doctorData?.email?.toLocaleLowerCase()}
        </p>
        <div className='flex flex-col gap-2'>
          {isMobile && (
            <div className='rounded-lg border border-mediumGray bg-lightGray px-3 py-2 text-sm text-textColor'>
              Workspace switching is available on Desktop only.
            </div>
          )}
          {doctorData?.profiles?.map((profile) => {
            const subscriptionPlanName =
              doctorData.subscriptions.find((sub) => sub.profile_id === profile.profile_id)
                ?.plan_metadata?.plan_name ?? ''
            const {isPractice, isCustomer, isVendor} = useAllUserPlan()
            if (isMobile) return null

            return (
              <Profile
                key={profile?.profile_id}
                {...{
                  profile: profile,
                  className: '',
                  onClick: async () => {
                    // login
                    apiHelper(
                      `${URL_GET_SUBSCRIPTION}${profile.doctor_id}/${profile?.profile_id}`,
                      HttpMethod.GET
                    ).then((res) => {
                      const userSubscriptionResponse = res.data

                      if (isTrialPlanAboutToExpire(userSubscriptionResponse)) {
                        getStorageType().setItem('trialPlanAboutToExpireModal', 'true')
                      }
                      if (isPlanAboutToExpire(userSubscriptionResponse)) {
                        getStorageType().setItem('planAboutToExpireModal', 'true')
                      }
                      switchProfile(
                        safeParseInt(profile?.doctor_id),
                        safeParseInt(profile?.profile_id),
                        safeParseInt(profile?.organization_id),
                        profile?.org_name
                      )
                    })
                  },
                  showCheckMarkIcon: profile?.profile_id === activeProfile?.profile_id,
                  subText: (
                    <>
                      {!isCustomer && !isVendor && (
                        <p className=' text-textColor'>
                          {isPractice
                            ? profile?.owner_organization_name
                            : getPlanDisplayName(subscriptionPlanName)}
                        </p>
                      )}
                    </>
                  ),
                }}
              />
            )
          })}
        </div>
      </div>
      <div className='w-full border border-mediumGray' />
      <When isTrue={brand === brandNamesConstants.DENTALSTACK}>
        <button
          type='button'
          onClick={() => {
            navigate('/settings/profileManagement')
            setOpenCollapsed(false)
          }}
          className='px-3 font-semibold flex gap-2'
        >
          <UserCircleIcon />
          <p>Manage profiles</p>
        </button>
        <div className='w-full border border-mediumGray' />
      </When>
      <button
        type='button'
        onClick={(event) => {
          event.stopPropagation()
          dispatchAction(setIsMobileSidebarOpen(false))
          logout()
        }}
        className='px-3 flex gap-2  font-semibold text-red'
      >
        <SignOutIcon />
        <p>Log out</p>
      </button>
    </div>
  )
}

export default ProfileDropDown
