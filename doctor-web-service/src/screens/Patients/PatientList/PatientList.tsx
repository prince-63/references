import {useContext, useEffect, useState, useRef} from 'react'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getPatientsCountList,
  getPatientsList,
  getPatientsListForOrg,
  RequestPatientList,
  RequestPatientListCount,
  RequestPatientListForOrg,
  setAllResetFilter,
  setStatusFilter,
  setGlobalFilter,
  setPatientType,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import TableContainerForPatientList from './components/TableContainerForPatientList'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import PatientsFilterData from './components/PatientsFilterData'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useActiveProfile from '@hooks/useActiveProfile'
import When from 'components/when/When'
import FilterSelector from './components/types/FilterSelector'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import {getActiveCustomersList} from 'redux/Slices/AppSlice/Customers/customers.slice'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {getApiDataProductionList} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import filterPatientList from '@constants/filterPatientList'
import {GlobalStatusType} from './components/CountBox'
import {getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {useSearchParams} from 'react-router-dom'
import useAllUserRoles from '@hooks/useAllUserPlan'
import useFilter from '@hooks/useFilter'
import patientFilterNavBar from '@staticData/patientFilterNavBar'
import getActiveFilter from './utils/getActiveFilter'
import hasValue from 'utils/hasValue'
import rolesConstants from '@constants/roles.constants'
import subscriptionModulesConstants from '@constants/subscriptionModules.constants'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import isPlanExpired from '@utils/isPlanExpired'
import SubscriptionInfoCardWrapper from 'components/subscription/SubscriptionInfoCardWrapper'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import TableContainerForStarterPlanUserPatientList from './components/TableContainerForStarterPlanUserPatientList'
import NoAccess from 'components/emptyState/NoAccess'

const PatientList = () => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {
    statusFilter,
    globalFilter,
    practiceLocation,
    customerOrPractice,
    brandName,
    patient_type,
    practiceLocationForOrg,
    customerOrPracticeForOrg,
  } = useSelector((state: RootState) => state.patientsList)
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [search, setSearch] = useState<string | null>(null)
  const {activeProfile} = useActiveProfile()
  const {
    isDesignLabUser,
    isCustomer,
    isVendor,
    isPractice,
    isAlignerCompanyOrg,
    isGrowthPlanUser,
    isOrganization,
    isStarterPlanUser,
  } = useAllUserPlan()
  const {permissionChecks, sidebarAccess} = useFeatureAccess()
  const appInviteStatusAccess =
    permissionChecks?.patientManagement?.patientConnectionStatus?.isViewable
  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  const role = activeProfile.roles.map((role) => role.name)
  const previousGlobalFilterRef = useRef<GlobalStatusType | null>(
    (globalFilter as GlobalStatusType) ?? null
  )

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (!isStarterPlanUser) {
        const previousFilter = previousGlobalFilterRef.current
        dispatchAction(setGlobalFilter(previousFilter ?? 'ALL'))
        dispatchAction(setPatientType('ALL'))
      }
    }
  }, [])

  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'
  const {isEnterprisePlanUser} = useAllUserRoles()
  const {filter} = useFilter(patientFilterNavBar)
  const activeFilter: string = getActiveFilter({
    filter,
  })
  const shouldHidePatientFilters = isVendor
  const [patientListBy, setPatientListBy] = useState<string | null>(
    isEnterprisePlanUser || isGrowthPlanUser || isPractice || isCustomer
      ? 'CONSULTING_ORTHODONTIST'
      : null
  )
  const isCustomerList = searchParams.get('isCustomerList') === 'true'
  const shouldShowStatusFilter =
    appInviteStatusAccess &&
    (activeFilter !== 'CUSTOMER' || isCustomer || isPractice || isGrowthPlanUser)

  useEffect(() => {
    setPatientListBy(filter.PRACTICE ? 'CONSULTING_ORTHODONTIST' : 'CUSTOMER')
  }, [activeFilter])

  const shouldUseOrgEndpoints = isPractice || isAlignerCompanyOrg || isGrowthPlanUser || isCustomer
  const {loadingSubscriptionData, subscriptionData} = useSubscriptionDetails()
  const planName = subscriptionData?.plan_metadata?.plan_name
  const isPlanInfoReady =
    shouldUseOrgEndpoints ||
    isDesignLabUser ||
    isCustomer ||
    isVendor ||
    isOrganization ||
    Boolean(planName)

  // determine if the user’s subscription is expired or otherwise restricted
  const expiredPlan =
    isPlanExpired(subscriptionData) ||
    subscriptionData?.is_lab_staff_deactivated ||
    subscriptionData?.plan_metadata?.request_deletion

  useEffect(() => {
    if (!isPlanInfoReady) return
    if (isFiltered) {
      if (!isModalConnectWithPatientOpen) {
        // Use the current globalFilter from Redux state when filtered
        getPatientList({
          page: 1,
          search: search,
          globalFilters: globalFilter,
          statusFilters: statusFilter || 'ALL',
        })
      }
    } else {
      // Only reset filters when not filtered
      if (!globalFilter) {
        dispatchAction(setAllResetFilter('ALL'))
        dispatchAction(setStatusFilter(null))
      }
      getPatientList({
        page: 1,
        search: search,
        globalFilters: globalFilter || undefined,
        statusFilters: statusFilter || 'ALL',
        filter_by_role: isCustomerList ? 'CUSTOMER' : 'CONSULTING_ORTHODONTIST',
      })
    }
  }, [
    isFiltered,
    isModalConnectWithPatientOpen,
    globalFilter,
    isPlanInfoReady,
    shouldUseOrgEndpoints,
    isCustomerList,
  ])

  const getClinics = () => {
    dispatchAction(
      getPracticeLocationsList({doctor_id: safeParseInt(userId), include_unassigned: false})
    )
  }

  useEffect(() => {
    getClinics()
    getPatientListCount()
    getCallBrandListAPI()
  }, [])

  useEffect(() => {
    if (activeFilter === 'PRACTICE') {
      getActivePracticeList()
    } else if (activeFilter === 'CUSTOMER') {
      if (isAlignerCompanyOrg || isDesignLabUser || isVendor) {
        getCustomerList()
      }
    }
  }, [activeFilter, userId, organizationId, profileId])

  //  Filter API calls
  const getCallBrandListAPI = () => {
    const payload = {
      doctorId: safeParseInt(userId),
    }
    dispatchAction(getApiDataProductionList({payload}))
  }

  const getActivePracticeList = async () => {
    if (userId && organizationId && profileId) {
      await dispatchAction(
        getActivePractices({
          data: {
            sort_order: 'PRACTICE_NAME_ASC',
            page_number: 0,
            page_size: 0,
            search: '',
            doctor_id: safeParseInt(userId),
            organization_id: safeParseInt(organizationId),
            invitation_status: 'ACCEPTED',
            invitation_roles: ['CONSULTING_ORTHODONTIST'],
          },
        })
      )
    }
  }

  const getCustomerList = async () => {
    dispatchAction(
      getActiveCustomersList({
        payload: {
          doctor_id: String(userId),
          invitation_status: 'ACCEPTED',
          sort_order: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST,
          page_number: 0,
          page_size: 1000,
          search: null,
        },
        roles: activeProfile.roles,
      })
    )
  }

  const getPatientListCount = async () => {
    const payload: RequestPatientListCount = {
      doctor_id: safeParseInt(userId),
      role: filter.PRACTICE ? 'CONSULTING_ORTHODONTIST' : null,
    }
    dispatchAction(getPatientsCountList(payload))
  }

  // Main API call
  const getPatientList = async ({
    page = 1,
    search = null,
    globalFilters = globalFilter,
    statusFilters = statusFilter,
    filter_by_role = patientListBy,
  }: {
    statusFilters?: keyof typeof filterPatientList | 'ALL'
    globalFilters?: GlobalStatusType
    page?: number
    search?: string | null
    filter_by_role?: string | null
  }) => {
    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    setSearch(search)
    setCurrentPageNumber(page)
    if (isPractice || isAlignerCompanyOrg || isGrowthPlanUser) {
      const payload: RequestPatientListForOrg = {
        page_number: page - 1,
        doctor_id: safeParseInt(userId),
        search: search?.trim() ?? null,
        practice_location_ids: practiceLocationForOrg ? [practiceLocationForOrg] : [],
        practice_profile_ids: customerOrPracticeForOrg ? [customerOrPracticeForOrg] : [],
        filter_by_app_invite_status: statusFilters ?? 'ALL',
        filter_by_global_status: 'ALL',
        doctor_role: role[0],
        patient_type: patient_type,
        practice_filter: 'ALL',
        treatment_type_filter: 'ALIGNER',
        customer_or_practice_role: filter_by_role ?? rolesConstants.CONSULTING_ORTHODONTIST,
      }
      dispatchAction(
        getPatientsListForOrg({
          payload,
          signal: abortControllerRef.current.signal,
        })
      )
    } else {
      const payload: RequestPatientList = {
        page_number: page,
        doctor_id: safeParseInt(userId),
        search: search?.trim() ?? '',
        practice_location: hasValue(practiceLocation) ? [practiceLocation] : [],
        filter_by_treatment_type: brandName,
        filter_by_practice_name: customerOrPractice === 'ASSIGNED' ? '' : customerOrPractice,
        filter_by_app_invite_status: statusFilters ?? 'ALL',
        filter_by_global_status: globalFilters,
        filter_by_role: filter_by_role ?? null,
      }
      dispatchAction(
        getPatientsList({
          payload,
          signal: abortControllerRef.current.signal,
        })
      )
    }
  }

  const handleSearch = (search: string | null) => {
    getPatientList({
      page: 1,
      search: search,
      statusFilters: statusFilter,
      globalFilters: globalFilter,
    })
  }

  const onStatusFilter = (statusFilter: keyof typeof filterPatientList | 'ALL') => {
    getPatientList({
      page: 1,
      search: search,
      statusFilters: statusFilter,
      globalFilters: globalFilter,
    })
  }

  const canViewPatientList = sidebarAccess?.patients || isStarterPlanUser

  // read bottom bar state so we can remove extra margin when it shows
  const {isBottomBarOpen} = useSelector((state: RootState) => state.mobileSidebar)

  return (
    <>
      {canViewPatientList ? (
        <div className='md:pb-0 pb-[70px]'>
          <div className='flex gap-2 my-3'>
            <PracticeSearchInput handleSearch={handleSearch} placeholder={'search'} />
            <When isTrue={!shouldHidePatientFilters}>
              <PatientsFilterData activeFilter={activeFilter} />
            </When>
          </div>
          <When isTrue={isCustomer || isPractice || isAlignerCompanyOrg}>
            <SubscriptionInfoCardWrapper
              {...{
                type: subscriptionModulesConstants.patients,
                subscriptionData,
                loadingSubscriptionData,
              }}
            />
          </When>

          <div className='flex gap-2 my-3'>
            <When isTrue={shouldShowStatusFilter}>
              <FilterSelector onStatusFilter={onStatusFilter} />
            </When>
          </div>
          <div className={isBottomBarOpen && !expiredPlan ? 'mb-0' : 'mb-3'}>
            {isStarterPlanUser ? (
              <TableContainerForStarterPlanUserPatientList
                search={search}
                pageNumber={pageNumber}
                handleOnSearch={getPatientList}
              />
            ) : (
              <TableContainerForPatientList
                search={search}
                pageNumber={pageNumber}
                handleOnSearch={getPatientList}
              />
            )}
          </div>
        </div>
      ) : (
        <NoAccess moduleName='Patient List' />
      )}
    </>
  )
}

export default PatientList
