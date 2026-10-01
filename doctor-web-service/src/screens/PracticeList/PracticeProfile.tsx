import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {AuthContext} from 'context/AuthContext'
import {getImageUrlById, getSalutations, safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getCustomerPatientsList,
  setAllResetFilter,
  setStatusFilter,
  setGlobalFilter,
  setPatientType,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import useFilter from '@hooks/useFilter'

import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useActiveProfile from '@hooks/useActiveProfile'
import {Image} from 'assets/images/Images/Image'

import practiceSortingConstants from '@constants/practiceSorting.constants'
import {
  getActiveCustomersList,
  setDataEditCustomer,
} from 'redux/Slices/AppSlice/Customers/customers.slice'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {getApiDataProductionList} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import filterPatientList from '@constants/filterPatientList'
import {GlobalStatusType} from '../Patients/PatientList/components/CountBox'
import {getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import hasValue from 'utils/hasValue'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {BsThreeDotsVertical} from 'react-icons/bs'
import {Popover} from 'antd'
import PencilIcon from 'assets/icons/PencilIcon'
import {RxCaretRight} from 'react-icons/rx'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import Navbar from './components/Navbar'
import practiceProfileNavbarItems from './components/practiceProfileNavbarItems'
import {Outlet, useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {PracticeProfileOutletContext} from './types/practiceProfile.types'
import CountBoxForPractice from './components/CountBoxForPractice'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import practiceProfileRouteConstants from '@constants/practiceProfile.routeConstants'
import ArrowLeft from '../../assets/icons/ArrowLeft'
import useServiceConfigurationState from 'screens/settings/services/hooks/useServiceConfigurationState'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import {
  getPatientDoctorMiniDashboardV4,
  getVspMiniDashboard,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import getVspMiniDashboardPayload from './helpers/getVspMiniDashboardPayload'
const stripTrailingSlash = (path: string) => path.replace(/\/+$/, '')

type PracticeProfileProps = {
  readMode?: boolean
}

const PracticeProfile = ({readMode = false}: PracticeProfileProps) => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {statusFilter, globalFilter} = useSelector((state: RootState) => state.patientsList)
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [search, setSearch] = useState<string | null>(null)
  const {activeProfile} = useActiveProfile()
  const {customerId} = useParams<{customerId: string}>()
  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const navItems = useMemo(
    () =>
      readMode
        ? practiceProfileNavbarItems.filter(
            (item) => item.value !== practiceProfileRouteConstants.PATIENTS
          )
        : practiceProfileNavbarItems,
    [readMode]
  )
  const {filter, handleFilterChange} = useFilter(navItems)
  const abortControllerRef = useRef<AbortController | null>(null)
  const location = useLocation()
  const isLabProfilePath = location.pathname.includes('/practice-lab-profile/')
  const basePath = isLabProfilePath
    ? `/practice-lab-profile/${customerId}`
    : `/practice-profile/${customerId}`
  const normalizedBasePath = stripTrailingSlash(basePath)
  const normalizedLocationPath = stripTrailingSlash(location.pathname)
  const navigate = useNavigate()
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/practices')
    }
  }

  const handleTabClick = (value: (typeof practiceProfileNavbarItems)[number]['value']) => {
    handleFilterChange(value)
    const target = navItems.find((item) => item.value === value)
    if (!target) return
    navigate(`${normalizedBasePath}/${target.path}`, {state: location.state})
  }
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

  useEffect(() => {
    if (!customerId) return

    const matchesTab = navItems.some(
      (item) => normalizedLocationPath === stripTrailingSlash(`${normalizedBasePath}/${item.path}`)
    )

    if (normalizedLocationPath === normalizedBasePath || !matchesTab) {
      const fallbackPath = navItems[0]?.path || 'profile'
      navigate(`${normalizedBasePath}/${fallbackPath}`, {replace: true, state: location.state})
    }
  }, [customerId, navigate, normalizedBasePath, normalizedLocationPath, location.state, navItems])

  useEffect(() => {
    const activeTab = navItems.find(
      (item) => normalizedLocationPath === stripTrailingSlash(`${normalizedBasePath}/${item.path}`)
    )
    if (activeTab) {
      handleFilterChange(activeTab.value)
    }
  }, [navItems, normalizedBasePath, normalizedLocationPath, handleFilterChange])
  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'
  const {sections, loading: loadingServiceConfiguration} = useServiceConfigurationState()
  const isPlanningManufacturingActive = useMemo(
    () =>
      sections.some(
        (section) =>
          (section.itemName === ServiceConfigurationItemName.PLANNING ||
            section.itemName === ServiceConfigurationItemName.MANUFACTURING) &&
          section.isActive
      ),
    [sections]
  )
  const isVspPlanning = useMemo(
    () =>
      sections.some(
        (section) =>
          section.itemName === ServiceConfigurationItemName.VSP_PLANNING && section.isActive
      ),
    [sections]
  )

  const isCustomerList = searchParams.get('isCustomerList') === 'true'

  useEffect(() => {
    if (loadingServiceConfiguration) return
    if (isVspPlanning) return
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
    isPlanningManufacturingActive,
    isVspPlanning,
    loadingServiceConfiguration,
  ])

  useEffect(() => {
    const parsedProfileId = safeParseInt(profileId)
    const parsedCustomerId = safeParseInt(customerId)
    if (!parsedProfileId || !parsedCustomerId) return

    if (loadingServiceConfiguration) return

    if (!isVspPlanning) {
      dispatchAction(
        getPatientDoctorMiniDashboardV4({
          customer_profile_id: parsedCustomerId,
          profile_id: parsedProfileId,
        })
      )
      return
    }

    dispatchAction(
      getVspMiniDashboard(
        getVspMiniDashboardPayload({
          profileId: parsedProfileId,
          customerProfileId: parsedCustomerId,
        })
      )
    )
  }, [customerId, dispatchAction, isVspPlanning, loadingServiceConfiguration, profileId])

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

    const parsedProfileId = safeParseInt(profileId)
    const parsedCustomerId = safeParseInt(customerId)
    if (!parsedProfileId || !parsedCustomerId) return
    dispatchAction(
      getCustomerPatientsList({
        profile_id: parsedProfileId,
        customer_id: parsedCustomerId,
        search: search?.trim() ?? null,
        page_number: page - 1,
        page_size: 10,
      })
    )
    return
  }

  const handleSearch = (search: string | null) => {
    getPatientList({
      page: 1,
      search: search,
      statusFilters: search ? 'ALL' : statusFilter,
      globalFilters: search ? 'ALL' : globalFilter,
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

  const practiceObject: Invitation = location.state

  const practiceProfileUrl = practiceObject?.profile_image_id
    ? getImageUrlById(practiceObject?.profile_image_id)
    : practiceObject?.profile_url
  const first_name = practiceObject?.first_name
  const last_name = practiceObject?.last_name || ''
  const full_name = `${first_name} ${last_name}`
  const salutation = practiceObject?.salutation || ''
  const mobile = practiceObject?.mobile_no || ''
  const country_code = practiceObject?.country_code || ''
  const email = practiceObject?.email || ''
  const outletContext: PracticeProfileOutletContext = {
    search,
    pageNumber,
    handleSearch,
    onStatusFilter,
    getPatientList,
    isVspPlanning,
    readMode,
  }

  return (
    <div>
      <div className='flex items-center gap-2 px-4 pt-4'>
        <button
          type='button'
          onClick={handleBack}
          className='flex items-center gap-2 text-textColor'
        >
          <ArrowLeft />
          <span className='font-semibold text-textColor'>Back</span>
        </button>
      </div>
      <div className='flex gap-2 my-3 items-center justify-between'>
        <div className='flex gap-4 justify-center items-center'>
          {hasValue(practiceProfileUrl) ? (
            <Image
              className='w-12 h-12 object-cover rounded-full'
              src={practiceProfileUrl}
              showLoading={true}
            />
          ) : (
            <PatientProfileInitials
              name={practiceObject?.first_name}
              className='h-12 w-12 text-base font-semibold'
            />
          )}

          <div className='flex flex-col'>
            <span className='text-2xl font-semibold text-black'>{`${getSalutations(
              salutation
            )} ${full_name}`}</span>
            <div className='flex justify-center items-center gap-2'>
              <span className='text-textColor font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
                {email}
              </span>

              {email && mobile && <div className='w-1 h-1 rounded-full bg-textColor'></div>}

              <span className='text-textColor font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
                {mobile && `${country_code} ${mobile}`}
              </span>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center gap-3'>
          <div className='w-2 h-2 rounded-full bg-tertiaryColor'></div>
          <span className='font-figtree text-sm font-medium leading-5 tracking-[0.14px] text-textColor'>
            Active
          </span>
          {!readMode && (
            <Popover
              content={
                <div
                  className='flex items-center justify-between w-56 hover:!bg-primarySupport cursor-pointer'
                  onClick={() => {
                    dispatchAction(setDataEditCustomer(practiceObject))
                    const queryParams = new URLSearchParams({
                      edit: 'true',
                    }).toString()
                    navigate(`/customers-add/${practiceObject?.invitation_id}?${queryParams}`)
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
          )}
        </div>
      </div>

      <CountBoxForPractice isVspPlanning={isVspPlanning} />

      <div className='mt-4'>
        <Navbar filter={filter} handleFilterChange={handleTabClick} navItems={navItems} />
      </div>

      <div className='mt-4 pb-20 md:pb-0'>
        <Outlet context={outletContext} />
      </div>
    </div>
  )
}

export default PracticeProfile
