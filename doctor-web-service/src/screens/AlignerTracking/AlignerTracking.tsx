import filterPatientList from '@constants/filterPatientList'
import rolesConstants from '@constants/roles.constants'
import subscriptionModulesConstants from '@constants/subscriptionModules.constants'
import useActiveProfile from '@hooks/useActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {Header} from 'components/PatientList/Header'
import SubscriptionInfoCardWrapper from 'components/subscription/SubscriptionInfoCardWrapper'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import {useContext, useState, useRef, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useSearchParams} from 'react-router-dom'
import {getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {
  setGlobalFilter,
  setPatientType,
  setStatusFilter,
  RequestPatientListForOrg,
  getPatientsListForOrg,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import {RootState} from 'redux/store'
import {GlobalStatusType} from 'screens/Patients/PatientList/components/CountBox'
import CountBoxForTracking from './components/CountBoxForTracking'
import FilterSelector from 'screens/Patients/PatientList/components/types/FilterSelector'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import {safeParseInt} from 'utils/ConstFunctions'
import TableContainerForAlignerTracking from './components/TableContainerForAlignerTracking'
import PatientsFilterData from './components/PatientFilterData'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import AlignerTrackingV3 from './AlignerTrackingV3'

const AlignerTracking = () => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {statusFilter, globalFilter, practiceLocationForOrg} = useSelector(
    (state: RootState) => state.patientsList
  )
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [search, setSearch] = useState<string | null>(null)
  const {activeProfile} = useActiveProfile()
  const {isCustomer, isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  const role = (activeProfile?.roles ?? []).map((role) => role.name)
  const {permissionChecks} = useFeatureAccess()
  const appInviteStatusAccess =
    permissionChecks?.patientManagement?.patientConnectionStatus?.isViewable
  const alignerTreatmentAccess = permissionChecks?.alignerTreatment

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      dispatchAction(setGlobalFilter('ALL'))
      dispatchAction(setPatientType('ALL'))
    }
  }, [dispatchAction])
  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'

  useEffect(() => {
    if (!activeProfile || isPractice) return

    if (isFiltered) {
      if (!isModalConnectWithPatientOpen) {
        getPatientList({
          page: 1,
          search: search,
          globalFilters: globalFilter,
          statusFilters: statusFilter || 'ALL',
        })
      }
    } else {
      dispatchAction(setGlobalFilter('ALL_TREATMENT_TRACKING'))
      dispatchAction(setStatusFilter(null))

      getPatientList({
        page: 1,
        search: search,
        globalFilters: 'ALL_TREATMENT_TRACKING',
        statusFilters: 'ALL',
      })
    }
  }, [activeProfile, isFiltered, isModalConnectWithPatientOpen, isPractice])

  const getClinics = () => {
    dispatchAction(
      getPracticeLocationsList({doctor_id: safeParseInt(userId), include_unassigned: false})
    )
  }

  useEffect(() => {
    if (!activeProfile || isPractice) return
    getClinics()
  }, [activeProfile, isPractice])

  // Main API call
  const getPatientList = async ({
    page = 1,
    search = null,
    globalFilters = globalFilter,
    statusFilters = statusFilter,
  }: {
    statusFilters?: keyof typeof filterPatientList | 'ALL'
    globalFilters?: GlobalStatusType
    page?: number
    search?: string | null
  }) => {
    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    setSearch(search)
    setCurrentPageNumber(page)
    const payload: RequestPatientListForOrg = {
      page_number: page - 1,
      doctor_id: safeParseInt(userId),
      search: search?.trim() ?? null,
      practice_location_ids: practiceLocationForOrg ? [practiceLocationForOrg] : [],
      practice_profile_ids: [],
      filter_by_app_invite_status: statusFilters ?? 'ALL',
      filter_by_global_status: globalFilters,
      doctor_role: role[0],
      patient_type: 'ALL',
      practice_filter: 'ALL',
      treatment_type_filter: 'ALIGNER',
      customer_or_practice_role: rolesConstants.CONSULTING_ORTHODONTIST,
    }
    dispatchAction(
      getPatientsListForOrg({
        payload,
        signal: abortControllerRef.current.signal,
      })
    )
  }

  const onGlobalFilter = (globalFilter: GlobalStatusType) => {
    dispatchAction(setGlobalFilter(globalFilter))
    dispatchAction(setStatusFilter(null))
    getPatientList({page: 1, search: search, globalFilters: globalFilter, statusFilters: 'ALL'})
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

  const {loadingSubscriptionData, subscriptionData} = useSubscriptionDetails()

  if (isPractice) {
    return <AlignerTrackingV3 />
  }

  return (
    <>
      {alignerTreatmentAccess?.alignerTracking?.isViewable ? (
        <div className='flex flex-col gap-4 md:pb-0 pb-[70px]'>
          <Header
            title={'Treatment Tracking'}
            subtitle={
              'Monitor cases from delivery to completion with reminders, start dates, and progress updates.'
            }
            activeList={true}
            showArchiveButton={false}
            showAddPatientButton={false}
          />

          <CountBoxForTracking onGlobalFilter={onGlobalFilter} />

          <div className='flex gap-2'>
            <PracticeSearchInput handleSearch={handleSearch} placeholder={'search'} />
            <PatientsFilterData />
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
          <When isTrue={appInviteStatusAccess}>
            <div className='flex gap-2 '>
              <FilterSelector onStatusFilter={onStatusFilter} />
            </div>
          </When>
          <div className='mb-3'>
            <TableContainerForAlignerTracking
              search={search}
              pageNumber={pageNumber}
              handleOnSearch={getPatientList}
            />
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <span className='text-4xl'>🔒</span>
          </div>
          <div className='text-lg font-semibold text-textColor mb-2'>No access</div>
          <div className='text-sm text-gray-500 text-center max-w-md'>
            You don’t have permission to view Aligner Tracking.
          </div>
        </div>
      )}
    </>
  )
}

export default AlignerTracking
