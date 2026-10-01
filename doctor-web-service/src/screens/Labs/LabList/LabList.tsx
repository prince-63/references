import useDispatchAction from '@hooks/useDispatchAction'
import {useContext, useEffect, useState} from 'react'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import TableContainerForLabs from './components/TableContainerForLabs'
import {AuthContext} from 'context/AuthContext'
import LabListMobileContainer from './components/LabListMobileContainer'
import useFilter from '@hooks/useFilter'
import {Invitation} from './types/labs.types'
import LabListHeader from './components/LabListHeader'
import {safeParseInt} from 'utils/ConstFunctions'
import rolesConstants from '@constants/roles.constants'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {useNavigate, useSearchParams} from 'react-router-dom'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import When from 'components/when/When'
import SubscriptionInfoModal from 'components/subscription/modals/SubscriptionInfoModal'
import CheckIcon from 'assets/icons/CheckIcon'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {addOrEditLabs, getLabsList} from 'redux/Slices/AppSlice/Labs/labs.slice'
import practicesFilterNavItems from '@staticData/practicesFilterNavItems'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useActiveProfile from '@hooks/useActiveProfile'
import LabIcon from 'assets/icons/LabIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'
import NoAccess from 'components/emptyState/NoAccess'

const LabList = ({
  initialActiveTab,
}: {
  initialActiveTab?: keyof typeof practiceFilterConstants
} = {}) => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const isPendingFromQuery = searchParams.get('invitation') === 'true'
  const initialFilterFromProps = isPendingFromQuery
    ? practiceFilterConstants.PENDING
    : initialActiveTab
  const {filter, handleFilterChange} = useFilter(
    practicesFilterNavItems,
    true,
    initialFilterFromProps
  )
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const activeTab: keyof typeof practiceFilterConstants = getActiveFilter({
    filter,
  }) as keyof typeof practiceFilterConstants
  const navigate = useNavigate()
  const [lockLab, setLockLab] = useState<boolean | undefined>(false)
  const {activeProfile} = useActiveProfile()

  const {isGrowthPlanUser, isPractice} = useAllUserPlan()

  const sendInvite = async (invitation: Invitation) => {
    try {
      await dispatchAction(
        addOrEditLabs({
          organization_id: safeParseInt(organizationId),
          profile_id: safeParseInt(profileId),
          doctor_id: safeParseInt(userId),
          email: invitation.email?.toLocaleLowerCase(),
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          mobile_no: invitation.mobile_no,
          country_code: invitation.country_code,
          salutation: invitation.salutation,
          doctor_role: rolesConstants.VENDOR,
          invitation_id: invitation.invitation_id,
          is_invitation_send: true,
        })
      )
        .unwrap()
        .then(() => {
          handleSearch(null)
          SuccessToast('Invite sent to email successfully!')
        })
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    if (isPendingFromQuery && initialActiveTab === undefined) {
      handleFilterChange(practiceFilterConstants.PENDING)
    }
    if (userId && organizationId && profileId) {
      dispatchAction(
        getLabsList({
          payload: {
            doctor_id: userId,
            invitation_status: initialActiveTab === 'PENDING' ? 'PENDING' : 'ACCEPTED',
            page_number: pageNumber - 1,
            page_size: 10,
            search: null,
            sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
          },
          roles: activeProfile.roles,
          isPractice: isPractice,
        })
      )
    }
    dispatchAction(setIsBottomBarOpen(true))
  }, [initialActiveTab])

  const handleSearch = (searchInput: string | null) => {
    if (userId && organizationId && profileId) {
      dispatchAction(
        getLabsList({
          payload: {
            doctor_id: userId,
            invitation_status: 'ALL',
            page_number: 0,
            page_size: 10,
            search: searchInput,
            sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
          },
          roles: activeProfile.roles,
          isPractice: isPractice,
        })
      )
    }
  }

  const handleOnSearch = async ({page = 1}: {page?: number}) => {
    if (userId && profileId && organizationId) {
      setCurrentPageNumber(page)
      const invitationStatus = isGrowthPlanUser ? 'ALL' : activeTab
      dispatchAction(
        getLabsList({
          payload: {
            doctor_id: userId,
            invitation_status: invitationStatus,
            page_number: page - 1,
            page_size: 10,
            search: null,
            sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
          },
          roles: activeProfile.roles,
          isPractice: isPractice,
        })
      )
    }
  }
  const {permissionChecks} = useFeatureAccess()
  const labPermissions = permissionChecks?.labManagement?.labManagement?.isAddable ?? false
  return (
    <>
      {permissionChecks?.labManagement?.labManagement?.isViewable || isPractice ? (
        <div className='flex flex-col gap-3 mx-4'>
          <When isTrue={lockLab}>
            <SubscriptionInfoModal
              {...{
                title: `Optimize your business with the Commercial Lab Plan`,
                subTitle: `Unlock new opportunities and manage your workflow with these powerful features:`,
                footerInfo:
                  'Upgrade to unlock full planning management and collaboration capabilities!',
                buttonText: 'Upgrade',
                HeaderIcon: LabIcon,
                iconClassName: 'bg-primarySupport',
                iconColor: '#735BF2',
                onClick: () => {
                  setLockLab(false)
                  navigate('/settings/upgrade-renew-subscription')
                },
                featuresHeader: 'During your trial, you can:',
                featuresList: [
                  {
                    icon: CheckIcon,
                    title: `Add and invite users to collaborate efficiently`,
                  },
                  {
                    icon: CheckIcon,
                    title: 'Assign users to received orders for streamlined processing',
                  },
                  {
                    icon: CheckIcon,
                    title: `Add and invite customers to receive orders from them`,
                  },
                  {
                    icon: CheckIcon,
                    title: `Receive, process, and manage orders effortlessly`,
                  },
                  {
                    icon: CheckIcon,
                    title: `Track and oversee orders from start to finish`,
                  },
                ],
                onClose: () => {
                  setLockLab(false)
                },
              }}
            />
          </When>

          <LabListHeader />

          <div className='flex gap-2'>
            <PracticeSearchInput handleSearch={handleSearch} />
          </div>

          <div className='hidden md:block '>
            <TableContainerForLabs
              pageNumber={pageNumber}
              handleOnSearch={handleOnSearch}
              sendInvite={sendInvite}
              activeTab={activeTab}
              {...{isAccessible: labPermissions}}
              isPractice={isPractice}
            />
          </div>

          <div className='md:hidden block'>
            <LabListMobileContainer
              {...{isAccessible: labPermissions, pageNumber, sendInvite, handleOnSearch, activeTab}}
            />
          </div>
        </div>
      ) : (
        <NoAccess moduleName='Labs List' />
      )}
    </>
  )
}

export default LabList
