import useDispatchAction from '@hooks/useDispatchAction'
import {useContext, useEffect, useState} from 'react'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import {AuthContext} from 'context/AuthContext'
import CustomerListMobileContainer from './components/CustomerListMobileContainer'
import FilterBar from './components/FilterBar'
import useFilter from '@hooks/useFilter'

import {addOrEditCustomers} from 'redux/Slices/AppSlice/Customers/customers.slice'
import CustomerListHeader from './components/CustomerListHeader'
import {safeParseInt} from 'utils/ConstFunctions'
import rolesConstants from '@constants/roles.constants'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {useNavigate, useSearchParams} from 'react-router-dom'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import When from 'components/when/When'
import SubscriptionInfoModal from 'components/subscription/modals/SubscriptionInfoModal'
import BoxIcon from 'assets/icons/BoxIcon'
import CheckIcon from 'assets/icons/CheckIcon'
import customerFilterConstants from '@constants/customerFilter.constants'
import TableContainerForCustomers from './components/TableContainerForCustomers'
import customersFilterNavItems from '@staticData/customersFilterNavItems'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import SortFilter from 'screens/Practices/PracticeList/components/SortFilter'
import {optionTypePractices} from 'screens/Practices/PracticeList/types/practices.types'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import customersActiveSortingOptions from '@staticData/customersActiveSortingOptions'
import customersInvitationsSortingOptions from '@staticData/customersInvitationsSortingOptions'
import {getPracticesList} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import NoAccess from 'components/emptyState/NoAccess'

const CustomerList = () => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {filter, handleFilterChange} = useFilter(customersFilterNavItems)
  const [customerListSort, setCustomerListSort] = useState<optionTypePractices>({
    label: 'Added on, newest to oldest',
    value: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST,
  })
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const activeTab: keyof typeof customerFilterConstants = getActiveFilter({
    filter,
  }) as keyof typeof customerFilterConstants
  const [searchParams] = useSearchParams()
  const isPending = searchParams.get('invitation') === 'true'
  const navigate = useNavigate()
  const [lockCustomer, setLockCustomer] = useState<boolean | undefined>(false)
  const [search, setSearch] = useState('')

  const sendInvite = async (invitation: Invitation) => {
    try {
      await dispatchAction(
        addOrEditCustomers({
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
          is_tracking_enabled: true,
          is_stl_file_view_enabled: true,
          is_print_file_view_enabled: false,
          is_scan_file_view_enabled: false,
        })
      )
        .unwrap()
        .then(() => {
          SuccessToast('Invite sent to email successfully!')
          handleSortFilter(customerListSort)
        })
    } catch (error) {
      throw error
    }
  }

  const handleSortFilter = (option: optionTypePractices) => {
    setCustomerListSort(option)
    if (userId && organizationId && profileId) {
      // WEB: keep your existing practices fetch (unchanged)
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
          invitation_roles: [
            'CONSULTING_ORTHODONTIST',
            'ENTERPRISE_CUSTOMER',
            'GROWTH_CUSTOMER',
            'PRACTICE_CUSTOMER',
          ],
        })
      )
    }
  }

  useEffect(() => {
    if (isPending) {
      handleFilterChange(customerFilterConstants.PENDING)
    }
    if (userId && organizationId && profileId) {
      const tab = isPending ? customerFilterConstants.PENDING : customerFilterConstants.ACCEPTED

      // WEB: practices fetch (original)
      dispatchAction(
        getPracticesList({
          doctor_id: userId,
          profile_id: profileId,
          organization_id: organizationId,
          invitation_status: tab,
          sort_order: customerListSort.value,
          page_number: pageNumber - 1,
          page_size: 10,
          search: null,
          invitation_roles: [
            'CONSULTING_ORTHODONTIST',
            'ENTERPRISE_CUSTOMER',
            'GROWTH_CUSTOMER',
            'PRACTICE_CUSTOMER',
          ],
        })
      )
    }
    dispatchAction(setIsBottomBarOpen(true))
  }, [])

  const handleSearch = (searchInput: string | null) => {
    setSearch(searchInput ?? '')
    if (userId && organizationId && profileId) {
      // WEB: practices fetch (original)
      dispatchAction(
        getPracticesList({
          doctor_id: userId,
          profile_id: profileId,
          organization_id: organizationId,
          invitation_status: activeTab,
          sort_order: customerListSort.value,
          page_number: 0,
          page_size: 10,
          search: searchInput,
          invitation_roles: [
            'CONSULTING_ORTHODONTIST',
            'ENTERPRISE_CUSTOMER',
            'GROWTH_CUSTOMER',
            'PRACTICE_CUSTOMER',
          ],
        })
      )
    }
  }

  // Keep pagination exactly as it was for web (customers slice was already used here)
  const handleOnSearch = async ({page = 1}: {page?: number}) => {
    if (userId && profileId && organizationId) {
      setCurrentPageNumber(page)

      // WEB list (table uses practices slice)
      dispatchAction(
        getPracticesList({
          doctor_id: userId,
          profile_id: profileId,
          organization_id: organizationId,
          invitation_status: activeTab,
          sort_order: customerListSort.value,
          page_number: page - 1,
          page_size: 10,
          search,
          invitation_roles: [
            'CONSULTING_ORTHODONTIST',
            'ENTERPRISE_CUSTOMER',
            'GROWTH_CUSTOMER',
            'PRACTICE_CUSTOMER',
          ],
        })
      )
    }
  }

  const {permissionChecks} = useFeatureAccess()
  const isAccessible = permissionChecks?.customerManagement?.customerManagement?.isAddable ?? false
  return (
    <>
      {permissionChecks?.customerManagement?.customerManagement?.isViewable ? (
        <div className='flex flex-col gap-3 mx-4 pb-[70px] md:pb-0'>
          <When isTrue={lockCustomer}>
            <SubscriptionInfoModal
              {...{
                title: `Optimize your business with the Commercial Lab Plan`,
                subTitle: `Unlock new opportunities and manage your workflow with these powerful features:`,
                footerInfo:
                  'Upgrade to unlock full planning management and collaboration capabilities!',
                buttonText: 'Upgrade',
                HeaderIcon: BoxIcon,
                iconClassName: 'bg-primarySupport',
                iconColor: '#735BF2',
                onClick: () => {
                  setLockCustomer(false)
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
                  setLockCustomer(false)
                },
              }}
            />
          </When>
          <CustomerListHeader {...{isAccessible, setLockCustomer}} />
          <div>
            <FilterBar
              {...{
                filter,
                handleFilterChange,
                setCustomerListSort,
              }}
            />
          </div>

          <div className='flex gap-2'>
            <PracticeSearchInput handleSearch={handleSearch} />
            <SortFilter
              practiceListSort={customerListSort.value}
              handleChange={handleSortFilter}
              list={
                activeTab === 'ACCEPTED'
                  ? customersActiveSortingOptions
                  : customersInvitationsSortingOptions
              }
            />
          </div>

          {/* WEB (unchanged) */}
          <div className='hidden md:block '>
            <TableContainerForCustomers
              search={search}
              pageNumber={pageNumber}
              handleOnSearch={handleOnSearch}
              sendInvite={sendInvite}
              activeTab={activeTab}
              {...{isAccessible}}
            />
          </div>

          {/* MOBILE */}
          <div className='md:hidden block'>
            <CustomerListMobileContainer
              {...{search, isAccessible, pageNumber, sendInvite, handleOnSearch, activeTab}}
            />
          </div>
        </div>
      ) : (
        <NoAccess moduleName=' Customer List' />
      )}
    </>
  )
}

export default CustomerList
