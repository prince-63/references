import useDispatchAction from '@hooks/useDispatchAction'
import {useContext, useEffect, useState} from 'react'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import TableContainerForPractices from './components/TableContainerForPractices'
import {AuthContext} from 'context/AuthContext'
import PracticeListMobileContainer from './components/PracticeListMobileContainer'
import FilterBar from './components/FilterBar'
import useFilter from '@hooks/useFilter'
import practicesFilterNavItems from '@staticData/practicesFilterNavItems'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {addOrEditPractices, getPracticesList} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {Invitation, optionTypePractices} from './types/practices.types'
import SortFilter from './components/SortFilter'
import PracticeSearchInput from './components/PracticeSearchInput'
import PracticeListHeader from './components/PracticeListHeader'
import {safeParseInt} from 'utils/ConstFunctions'
import rolesConstants from '@constants/roles.constants'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {useNavigate, useSearchParams} from 'react-router-dom'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import When from 'components/when/When'
import SubscriptionInfoModal from 'components/subscription/modals/SubscriptionInfoModal'
import BoxIcon from 'assets/icons/BoxIcon'
import CheckIcon from 'assets/icons/CheckIcon'
import practicesActiveSortingOptions from '@staticData/practicesActiveSortingOptions'
import practicesInvitationsSortingOptions from '@staticData/practicesInvitationsSortingOptions'

const PracticeList = () => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {filter, handleFilterChange} = useFilter(practicesFilterNavItems)
  const [practiceListSort, setPracticeListSort] = useState<optionTypePractices>({
    label: 'Practice name, ascending',
    value: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST,
  })
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const activeTab: keyof typeof practiceFilterConstants = getActiveFilter({
    filter,
  }) as keyof typeof practiceFilterConstants
  const [searchParams] = useSearchParams()
  const isPending = searchParams.get('invitation') === 'true'
  const navigate = useNavigate()
  const [lockPractice, setLockPractice] = useState<boolean | undefined>(false)

  const sendInvite = async (invitation: Invitation) => {
    try {
      await dispatchAction(
        addOrEditPractices({
          organization_id: safeParseInt(organizationId),
          profile_id: safeParseInt(profileId),
          doctor_id: safeParseInt(userId),
          email: invitation.email?.toLocaleLowerCase(),
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          mobile_no: invitation.mobile_no,
          country_code: invitation.country_code,
          salutation: invitation.salutation,
          doctor_role: rolesConstants.CONSULTING_ORTHODONTIST,
          invitation_id: invitation.invitation_id,
          is_invitation_send: true,
        })
      )
        .unwrap()
        .then(() => {
          SuccessToast('Invite sent to email successfully!')
          handleSortFilter(practiceListSort)
        })
    } catch (error) {
      throw error
    }
  }

  const handleSortFilter = (option: optionTypePractices) => {
    setPracticeListSort(option)
    if (userId && organizationId && profileId) {
      dispatchAction(
        getPracticesList({
          doctor_id: userId,
          profile_id: profileId,
          organization_id: organizationId,
          invitation_status: activeTab,
          sort_order: option.value,
          page_number: pageNumber - 1,
          page_size: 10,
          search: null,
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        })
      )
    }
  }

  useEffect(() => {
    if (isPending) {
      handleFilterChange(practiceFilterConstants.PENDING)
    }
    if (userId && organizationId && profileId) {
      dispatchAction(
        getPracticesList({
          doctor_id: userId,
          profile_id: profileId,
          organization_id: organizationId,
          invitation_status: isPending
            ? practiceFilterConstants.PENDING
            : practiceFilterConstants.ACCEPTED,
          sort_order: practiceListSort.value,
          page_number: pageNumber - 1,
          page_size: 10,
          search: null,
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        })
      )
    }
    dispatchAction(setIsBottomBarOpen(true))
  }, [])

  const handleSearch = (searchInput: string | null) => {
    if (userId && organizationId && profileId) {
      dispatchAction(
        getPracticesList({
          doctor_id: userId,
          profile_id: profileId,
          organization_id: organizationId,
          invitation_status: activeTab,
          sort_order: practiceListSort.value,
          page_number: 0,
          page_size: 10,
          search: searchInput,
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        })
      )
    }
  }

  const handleOnSearch = async ({page = 1}: {page?: number}) => {
    if (userId && profileId && organizationId) {
      setCurrentPageNumber(page)
      dispatchAction(
        getPracticesList({
          doctor_id: userId,
          profile_id: profileId,
          organization_id: organizationId,
          invitation_status: activeTab,
          sort_order: practiceListSort.value,
          page_number: page - 1,
          page_size: 10,
          search: null,
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        })
      )
    }
  }

  return (
    <div className='flex flex-col gap-3 mx-4'>
      <When isTrue={lockPractice}>
        <SubscriptionInfoModal
          {...{
            title: `Unlock practice management module`,
            subTitle: `Add practices and let them send aligner orders directly to your lab.`,
            footerInfo: 'Upgrade to the Professional Plan to unlock these features!',
            buttonText: 'Upgrade',
            HeaderIcon: BoxIcon,
            iconClassName: 'bg-primarySupport',
            iconColor: '#735BF2',
            onClick: () => {
              setLockPractice(false)
              navigate('/settings/upgrade-renew-subscription')
            },
            featuresHeader: 'During your trial, you can:',
            featuresList: [
              {
                icon: CheckIcon,
                title: `Simplify order management by accepting aligner orders directly from practices`,
              },
              {
                icon: CheckIcon,
                title: 'View patient aligner changes as updated by practices.',
              },
              {
                icon: CheckIcon,
                title: `Chat with practices for instant updates and coordination.`,
              },
              {
                icon: CheckIcon,
                title: `Track and manage aligner production status with ease.`,
              },
              {
                icon: CheckIcon,
                title: `No more emails or data transfers - Keep all patient records organized in one place`,
              },
            ],
            onClose: () => {
              setLockPractice(false)
            },
          }}
        />
      </When>
      <PracticeListHeader {...{isAccessible: true, setLockPractice}} />
      <div>
        <FilterBar
          {...{
            filter,
            handleFilterChange,
            setPracticeListSort,
          }}
        />
      </div>

      <div className='flex gap-2'>
        <PracticeSearchInput handleSearch={handleSearch} />

        <SortFilter
          practiceListSort={practiceListSort.value}
          handleChange={handleSortFilter}
          list={
            activeTab === 'ACCEPTED'
              ? practicesActiveSortingOptions
              : practicesInvitationsSortingOptions
          }
        />
      </div>

      <div className='hidden md:block '>
        <TableContainerForPractices
          pageNumber={pageNumber}
          handleOnSearch={handleOnSearch}
          sendInvite={sendInvite}
          activeTab={activeTab}
          {...{isAccessible: true}}
        />
      </div>

      <div className='md:hidden block'>
        <PracticeListMobileContainer
          {...{isAccessible: true, pageNumber, sendInvite, handleOnSearch, activeTab}}
        />
      </div>
    </div>
  )
}

export default PracticeList
