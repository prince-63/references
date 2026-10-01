import {useContext, useEffect, useState, useRef} from 'react'
import {AuthContext} from 'context/AuthContext'
import {getSalutations, safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getPatientsList,
  getPatientsListForOrg,
  RequestPatientList,
  RequestPatientListForOrg,
  setAllResetFilter,
  setStatusFilter,
  setGlobalFilter,
  setPatientType,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'

import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'

import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useActiveProfile from '@hooks/useActiveProfile'
import {Image} from 'assets/images/Images/Image'

import practiceSortingConstants from '@constants/practiceSorting.constants'
import {getActiveCustomersList} from 'redux/Slices/AppSlice/Customers/customers.slice'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {getApiDataProductionList} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import filterPatientList from '@constants/filterPatientList'
import {GlobalStatusType} from '../Patients/PatientList/components/CountBox'
import {getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'

import {DefaultImage} from 'assets/images/Images/DefaultImage'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {BsThreeDotsVertical} from 'react-icons/bs'
import {Popover} from 'antd'
import PencilIcon from 'assets/icons/PencilIcon'
import {RxCaretRight} from 'react-icons/rx'
import TableContainerForCustomerPatient from './TableContainerForCustomerPatient'
import useAllUserPlan from '@hooks/useAllUserPlan'

const CustomerProfile = () => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {
    statusFilter,
    globalFilter,
    practiceLocation,
    customerOrPractice,
    brandName,
    patient_type,
    treatment_type_filter,
    practiceLocationForOrg,
  } = useSelector((state: RootState) => state.patientsList)
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [search, setSearch] = useState<string | null>(null)
  const {activeProfile} = useActiveProfile()
  const {isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const {practiceId} = useParams<{practiceId: string}>()

  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  const role = (activeProfile?.roles ?? []).map((role) => role.name)
  useEffect(() => {
    return () => {
      // Cleanup: abort any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      // Reset globalFilter to "ALL" when component unmounts (user navigates away)
      dispatchAction(setGlobalFilter('ALL'))
      dispatchAction(setPatientType('ALL'))
    }
  }, [])
  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'

  const [patientListBy] = useState<string>('CUSTOMER')
  const isCustomerList = 'true'

  useEffect(() => {
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
  }, [isFiltered, isModalConnectWithPatientOpen, globalFilter])

  const getClinics = () => {
    dispatchAction(
      getPracticeLocationsList({doctor_id: safeParseInt(userId), include_unassigned: false})
    )
  }

  useEffect(() => {
    getClinics()

    getCustomerList()
    getActivePracticeList()
    getCallBrandListAPI()
  }, [])

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
    if (isPractice || isAlignerCompanyOrg) {
      const payload: RequestPatientListForOrg = {
        page_number: page - 1,
        doctor_id: safeParseInt(userId),
        search: search?.trim() ?? null,
        practice_location_ids: practiceLocationForOrg ? [practiceLocationForOrg] : [],
        practice_profile_ids: search ? [] : practiceId ? [practiceId] : [],
        filter_by_app_invite_status: statusFilters ?? 'ALL',
        filter_by_global_status: globalFilters,
        doctor_role: role[0],
        patient_type: patient_type,
        practice_filter: search ? 'ALL' : 'BY_PROFILE_ID',
        treatment_type_filter: treatment_type_filter,
        customer_or_practice_role: 'CUSTOMER',
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
  const navigate = useNavigate()

  const handleSearch = (search: string | null) => {
    getPatientList({
      page: 1,
      search: search,
      statusFilters: search ? 'ALL' : statusFilter,
      globalFilters: search ? 'ALL' : globalFilter,
    })
  }

  const location = useLocation()
  const practiceObject = location.state
  const first_name = practiceObject?.first_name
  const last_name = practiceObject?.last_name || ''
  const full_name = `${first_name} ${last_name}`
  const salutation = practiceObject?.salutation || ''
  const mobile = practiceObject?.mobile_no || ''
  const country_code = practiceObject?.country_code || ''
  const email = practiceObject?.email || ''

  return (
    <div>
      <div className='flex gap-1 items-center'>
        <div className='text-textColor font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
          Customer
        </div>
        <RxCaretRight />
        <div className='font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
          {`${getSalutations(salutation)} ${full_name}`}
        </div>
      </div>
      <div className='flex gap-2 my-3 items-center justify-between'>
        <div className='flex gap-4 justify-center items-center'>
          {hasValue(practiceObject?.profile_url) ? (
            <Image
              className='w-11 h-11 object-cover rounded-full'
              src={practiceObject?.profile_url}
              showLoading={true}
            />
          ) : (
            <DefaultImage letter={practiceObject?.first_name?.charAt(0)} />
          )}

          <div className='flex flex-col'>
            <span className='text-2xl font-semibold text-black'>{`${salutation} ${full_name}`}</span>
            <div className='flex justify-center items-center gap-2'>
              <span className='text-textColor font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
                {email}
              </span>

              {email && mobile && <div className='w-1 h-1 rounded-full bg-textColor'></div>}

              {mobile && (
                <span className='text-textColor font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
                  {`${country_code}${mobile}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center gap-3'>
          <div className='w-2 h-2 rounded-full bg-tertiaryColor'></div>
          <span className='font-figtree text-sm font-medium leading-5 tracking-[0.14px] text-textColor'>
            Active
          </span>
          <Popover
            content={
              <div
                className='flex items-center justify-between w-56 hover:!bg-primarySupport cursor-pointer'
                onClick={() => {
                  navigate(`/customers-add/${practiceObject?.profile_id}?edit=true`)
                }}
              >
                <div className='flex items-center'>
                  <PencilIcon />
                  <span className='ml-2'>Edit</span>
                </div>

                <RxCaretRight />
              </div>
            }
          >
            <AntdButton
              icon={
                <span className='text-textColor group-hover:text-primaryColor transition-colors duration-200'>
                  <BsThreeDotsVertical />
                </span>
              }
              className='h-10 w-10 bg-white hover:!bg-primarySupport hover:!text-textColor text-textColor text-base border border-textColor group'
            />
          </Popover>
        </div>
      </div>

      <div className='flex gap-2 my-3 items-center'>
        <PracticeSearchInput handleSearch={handleSearch} placeholder={'search'} />
      </div>

      <div className='mb-3'>
        <TableContainerForCustomerPatient
          search={search}
          pageNumber={pageNumber}
          handleOnSearch={getPatientList}
        />
      </div>
    </div>
  )
}

export default CustomerProfile
