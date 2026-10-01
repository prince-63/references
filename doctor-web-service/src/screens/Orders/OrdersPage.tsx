import HeaderTitle from 'components/header/HeaderTitle'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getActiveUsers,
  getOrderDetailsList,
  resetPatientDetails,
  setOrderFilters,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import TableContainerForOrders from './components/TableContainerForOrders'
import Filter from './components/Filter'
import Sort from './components/Sort'
import PlusIcon from 'assets/icons/PlusIcon'
import {useNavigate, useSearchParams} from 'react-router-dom'
import useActiveProfile from '@hooks/useActiveProfile'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import When from 'components/when/When'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import useFilter from '@hooks/useFilter'
import ordersPageFilterNavItems from '@staticData/ordersPageFilterNavItems'
import FilterBar from './components/FilterBar'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {orderNavigationItem, orderPageTabItems} from './orders.types'
import useAllUserPlan from '@hooks/useAllUserPlan'

import {
  enterpriseLabStaffCounts,
  getDashboardNewDetails,
  getVendorDashboardCounts,
} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import {default as GeneralStatBoxes} from './components/StatBoxes'
import {getSubscriptionDetails} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import rolesConstants from '@constants/roles.constants'
import orderFilterConstants from '@constants/orderFilter.constants'
import ordersPageFilterBarConstants from '@constants/ordersPageFilterBar.constants'
import {resetManufacturingListData} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {resetUpdatedInfo} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'

export type DisplayRole =
  | 'STARTER'
  | 'GROWTH'
  | 'PROFESSIONAL'
  | 'ENTERPRISE'
  | 'VENDOR'
  | 'CUSTOMER'
  | 'PRACTICE_CONNECTED_ORG'
  | 'DESIGN_LAB'
  | 'UNKNOWN'
  | 'INTERNAL_USER'

interface ActiveProfile {
  profile_type: 'INVITED' | 'OWNER' | string
}

const getDisplayRole = (role: string[] = [], activeProfile: ActiveProfile): DisplayRole => {
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
      case 'INTERNAL_USER':
        return 'INTERNAL_USER'
    }
  }

  if (
    activeProfile.profile_type === 'OWNER' &&
    mainRole === rolesConstants.COMMERCIAL_ALIGNER_LAB
  ) {
    return 'DESIGN_LAB'
  }

  return 'UNKNOWN'
}
const OrdersPage = () => {
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [sortCriteria, setSortCriteria] = useState({type: 'lastUpdated', sort: 'desc'})
  const {orderFilters} = useSelector((state: RootState) => state.orders)
  const [searchQuery, setSearchQuery] = useState('')
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {activeProfile} = useActiveProfile()
  const {
    isOrganization,
    isPractice,
    isCustomer,
    isDesignLabUser,
    isVendor,
    isAlignerCompanyOrg,
    isProfessionalPlanUser,
    isGrowthPlanUser,
  } = useAllUserPlan()
  const [searchParams] = useSearchParams()
  const role = (activeProfile?.roles ?? []).map((role) => role.name)
  const userRole = getDisplayRole(role, activeProfile ?? {})
  const isSentTab = searchParams.get('sent') === 'true'
  const isCustomerTab = searchParams.get('customerOrders') === 'true'

  const {filter, handleFilterChange} = useFilter(ordersPageFilterNavItems)
  const activeFilter = getActiveFilter<orderPageTabItems>({
    filter,
  })

  const queryActiveUsers = async (query: string) => {
    await dispatchAction(
      getActiveUsers({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: query,
          doctor_id: safeParseInt(userId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['LAB_STAFF', 'INTERNAL_USER'],
        },
      })
    )
  }

  useEffect(() => {
    if (userId) {
      dispatchAction(
        getVendorDashboardCounts({
          doctor_id: safeParseInt(userId),
        })
      )
    }
    dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
      .unwrap()
      .then((res: ISubscriptionDetails) => {
        dispatchAction(
          getDashboardNewDetails({
            doctor_id: safeParseInt(userId),
            roles: role,
            plan_name:
              userRole === 'INTERNAL_USER'
                ? userRole
                : userRole === 'UNKNOWN'
                  ? res?.plan_metadata?.plan_name
                  : res?.plan_metadata?.plan_name === 'ENTERPRISE'
                    ? 'ENTERPRISE_LAB_STAFF'
                    : userRole,
          })
        )
      })
    dispatchAction(
      enterpriseLabStaffCounts({
        doctor_id: safeParseInt(userId),
        role: null,
      })
    )
    queryActiveUsers('')
    return () => {
      dispatchAction(
        setOrderFilters({
          filterByOrderStatus: 'ALL',
        })
      )
      dispatchAction(resetManufacturingListData({}))
      dispatchAction(resetUpdatedInfo())
      dispatchAction(resetPatientDetails())
    }
  }, [userId])

  useEffect(() => {
    if (isSentTab || isProfessionalPlanUser || isCustomer) {
      handleTabChange('SENT')
    } else if (isCustomerTab) {
      handleTabChange('CUSTOMER')
    } else {
      handleOnSearch({order_flow: activeFilter})
    }
  }, [pageNumber, orderFilters.filterByOrderStatus, activeFilter])

  const handleOnSearch = async ({
    updateLoadingState = true,
    page = pageNumber,
    search = searchQuery,
    sort = sortCriteria,
    order_flow = activeFilter,
    status_filter = orderFilters.filterByOrderStatus,
    due_by_filter = orderFilters.filterByDueBy,
    filterByAssignedUser = orderFilters.filterByAssignedUser,
  }: {
    updateLoadingState?: boolean
    page?: number
    search?: string | null
    sort?: {
      type: string
      sort: string
    }
    order_flow?: keyof typeof ordersPageFilterBarConstants
    status_filter?: keyof typeof orderFilterConstants
    due_by_filter?: string
    filterByAssignedUser?: string
  }) => {
    if (!userId) throw new Error('User ID not found')
    setCurrentPageNumber(page)
    dispatchAction(
      getOrderDetailsList({
        doctor_id: safeParseInt(userId),
        updateLoadingState,
        page_number: page - 1,
        is_org_admin: isOrganization || isDesignLabUser || isVendor,
        sort_criteria: sort,
        filter_by_status: status_filter === 'ALL' ? null : status_filter,
        search: search,
        filter_by_due_by: due_by_filter === 'ALL' ? null : due_by_filter,
        filter_by_assigned_user: filterByAssignedUser === 'ALL' ? null : filterByAssignedUser,
        order_flow: order_flow,
      })
    )
  }

  const handleSortOption = (sortOption: {type: string; sort: string}) => {
    setSortCriteria(sortOption)
    handleOnSearch({sort: sortOption})
  }

  const handleSearch = (search: string) => {
    setSearchQuery(search)
    handleOnSearch({search: search})
  }

  const handleTabChange = (option: orderNavigationItem) => {
    if (option === 'CUSTOMER') {
      const queryParams = new URLSearchParams({
        customerOrders: 'true',
      }).toString()
      navigate(`/orders?${queryParams}`)
    } else if (option === 'SENT') {
      const queryParams = new URLSearchParams({
        sent: 'true',
      }).toString()
      navigate(`/orders?${queryParams}`)
    } else {
      navigate('/orders')
    }
    handleFilterChange(option)
    handleOnSearch({order_flow: option})
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap gap-3 justify-between items-center'>
        <HeaderTitle
          {...{
            title: isPractice || isAlignerCompanyOrg ? 'Planning Orders' : 'Orders',
            subTitle: 'Keep track of your orders here.',
          }}
        />

        <When isTrue={isPractice || isCustomer || isGrowthPlanUser}>
          <button
            type='button'
            className='md:w-fit w-full bg-primaryColor px-3 py-2 text-white rounded-lg flex gap-1 items-center justify-center'
            onClick={() => {
              navigate('create-order')
            }}
          >
            <PlusIcon color='#fff' />
            <div>Create an order</div>
          </button>
        </When>
      </div>

      <div className='flex flex-col gap-3'>
        <FilterBar
          {...{
            filter,
            handleFilterChange,
          }}
        />
        <GeneralStatBoxes filter={filter} />

        <div className='flex md:flex-row flex-col gap-3'>
          <PracticeSearchInput
            placeholder='Search'
            handleSearch={(value) => {
              handleSearch(value ?? '')
            }}
          />
          <div className='w-full flex gap-3'>
            <Filter filter={filter} setCurrentPageNumber={setCurrentPageNumber} />
            <Sort handleChange={handleSortOption} />
          </div>
        </div>

        <div className='w-full overflow-x-scroll'>
          <TableContainerForOrders
            pageNumber={pageNumber}
            handleOnSearch={handleOnSearch}
            filter={filter}
          />
        </div>
      </div>
    </div>
  )
}

export default OrdersPage
