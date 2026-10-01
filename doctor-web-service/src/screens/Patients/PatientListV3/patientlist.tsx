import React, {useContext, useEffect, useState, useCallback, useRef} from 'react'
import {getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {AuthContext} from 'context/AuthContext'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_PATIENTS_LIST_V3_CASES} from 'redux/Endpoints/apiEndpoints'
import {OrderStatus, PatientListResponseV3, PatientSummaryDTO} from './types'
import {safeParseInt} from 'utils/ConstFunctions'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {getEnabledProductListOptions} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {getVendorsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  getArchivePatientsList,
  RequestPatientList,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import {useLocation} from 'react-router-dom'
import cn from '@utils/cn'
import {
  PatientListHeader,
  PatientListPagination,
  PatientTableBody,
  PatientTableFilters,
  SortableHeader,
  usePatientColumns,
} from './components'
import {PATIENT_COLUMN_SORT_KEYS} from './patientColumnConfig'
import When from 'components/when/When'

export const BASE_APP_PATIENT_URL = process.env.REACT_APP_BASE_APP_PATIENT_URL

type LocationState = {
  dashboardFilter?: string | null // replace with your actual type
  patientListTab?: 'ACTIVE' | 'ARCHIVED'
}

const PatientListV3 = ({showRowSelector = true}: {showRowSelector?: boolean}) => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  const location = useLocation()
  const dashboardFilter = (location.state as LocationState | null)?.dashboardFilter ?? null
  const requestedPatientListTab = (location.state as LocationState | null)?.patientListTab ?? null

  const [data, setData] = useState<PatientSummaryDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)

  // Filters state — status from dashboardFilter if present
  const [search, setSearch] = useState('')
  const [clinicId, setClinicId] = useState<number | null>(null)
  const [customerMappedId, setCustomerMappedId] = useState('')
  const [productId, setProductId] = useState<number | null>(null)
  const [caseType, setCaseType] = useState<string | null>(null)
  const [status, setStatus] = useState<OrderStatus | null>(dashboardFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<string>('lastUpdated')
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC')
  const [isArchived, setIsArchived] = useState(requestedPatientListTab === 'ARCHIVED')

  // Redux data for filters
  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)
  const {enabledProductOptions} = useSelector((state: RootState) => state.productionSetup)
  const {activeVendorsList} = useSelector((state: RootState) => state.orders)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false
  const requestedProductOptionsKeyRef = useRef<string | null>(null)

  const showAcctiveFilters = serviceConfig?.PLANNING || serviceConfig?.VSP_PLANNING
  useEffect(() => {
    // Load clinics and vendors for filters
    dispatchAction(
      getPracticeLocationsList({doctor_id: safeParseInt(userId), include_unassigned: false})
    )
    dispatchAction(getVendorsList({doctor_id: safeParseInt(userId)}))
  }, [userId, dispatchAction])

  useEffect(() => {
    // Once vendors are loaded, fetch enabled products from the first vendor
    if (activeVendorsList?.length > 0) {
      const vendor = activeVendorsList[0]
      const requestKey = `${profileId}:${vendor.value}:${vendor.lab_organization_id}`
      if (requestedProductOptionsKeyRef.current === requestKey) return

      requestedProductOptionsKeyRef.current = requestKey
      dispatchAction(
        getEnabledProductListOptions({
          customer_profile_id: safeParseInt(profileId),
          owner_organization_id: safeParseInt(vendor.lab_organization_id),
          owner_profile_id: safeParseInt(vendor.value),
        })
      )
    }
  }, [activeVendorsList, profileId, dispatchAction])

  const fetchArchiveData = useCallback(async () => {
    setLoading(true)
    try {
      const payload: RequestPatientList = {
        page_number: page,
        doctor_id: safeParseInt(userId),
        search: search?.trim() ?? null,
        practice_location: [],
        archive: true,
        filter_by_app_invite_status: 'ALL',
        filter_by_global_status: 'ALL',
        filter_by_treatment_type: '',
        filter_by_practice_name: '',
        filter_by_role: null,
      }

      await dispatchAction(getArchivePatientsList(payload))
        .unwrap()
        .then((result: any) => {
          const mappedPatients = (result.patients || []).map((p: any) => ({
            ...p,
            product_name: p.product_type_names?.join(', ') || p.brand_name || p.product_name || '-',
            archived_on: p.archived_at || p.archived_on || null,
          }))
          setData(mappedPatients)
          setTotalRecords(result.pagination_details?.total_patients || 0)
        })
    } catch (error) {
      console.error('Error fetching archive patient list:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, userId, dispatchAction])

  const fetchActiveData = useCallback(async () => {
    setLoading(true)
    try {
      const url = isVspPlanning
        ? `${BASE_APP_PATIENT_URL}/patient/list/v3/vsp-cases`
        : URL_PATIENTS_LIST_V3_CASES

      const payload = {
        organization_id: safeParseInt(organizationId),
        profile_id: null,
        search: search || null,
        clinic_id: clinicId,
        customer_mapped_id: customerMappedId || null,
        product_id: productId ?? null,
        case_type: caseType as any,
        order_status: status || null,
        page_number: page - 1,
        page_size: pageSize,
        sort_by: sortBy,
        sort_direction: sortDirection,
        doctor_id: safeParseInt(userId),
      }

      const response = await apiHelper(url, HttpMethod.POST, payload)
      const resRaw = response.data
      const resData = resRaw as PatientListResponseV3
      setData(resData.patients || [])
      setTotalRecords(resData.pagination?.total_patients || 0)
    } catch (error) {
      console.error('Error fetching patient list V3:', error)
    } finally {
      setLoading(false)
    }
  }, [
    isVspPlanning,
    organizationId,
    search,
    clinicId,
    customerMappedId,
    productId,
    caseType,
    status,
    page,
    pageSize,
    sortBy,
    sortDirection,
    userId,
  ])

  const fetchData = useCallback(async () => {
    if (isArchived) {
      await fetchArchiveData()
    } else {
      await fetchActiveData()
    }
  }, [isArchived, fetchArchiveData, fetchActiveData])

  useEffect(() => {
    fetchData()
  }, [
    page,
    pageSize,
    clinicId,
    productId,
    caseType,
    status,
    sortBy,
    sortDirection,
    isVspPlanning,
    isArchived,
    search,
    customerMappedId,
  ])

  useEffect(() => {
    if (requestedPatientListTab === 'ARCHIVED') {
      setIsArchived(true)
      setPage(1)
      setStatus(null)
      return
    }

    if (requestedPatientListTab === 'ACTIVE') {
      setIsArchived(false)
      setPage(1)
      setStatus(null)
    }
  }, [requestedPatientListTab])

  const handleSort = useCallback(
    (columnId: string) => {
      const apiField = PATIENT_COLUMN_SORT_KEYS[columnId as keyof typeof PATIENT_COLUMN_SORT_KEYS]
      if (!apiField) return // column not sortable

      if (sortBy === apiField) {
        // Toggle direction, or reset if already ASC
        if (sortDirection === 'DESC') {
          setSortDirection('ASC')
        } else {
          // Reset to default
          setSortBy('lastUpdated')
          setSortDirection('DESC')
        }
      } else {
        setSortBy(apiField)
        setSortDirection('DESC')
      }
      setPage(1)
    },
    [sortBy, sortDirection]
  )

  const handleSearch = (searchOverride?: string) => {
    setPage(1)
    if (searchOverride !== undefined) {
      setSearch(searchOverride)
    }
    // fetchData will be triggered by useEffect when search or page changes
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  const columns = usePatientColumns(isVspPlanning, isArchived)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='md:p-3 bg-white min-h-screen font-figtree md:pb-3 pb-[70px]'>
      <PatientListHeader />

      <When isTrue={!showAcctiveFilters}>
        <div className='flex items-center border-b border-gray-200 mb-6'>
          <button
            onClick={() => {
              setIsArchived(false)
              setPage(1)
              setStatus(null)
            }}
            className={cn(
              'px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2',
              !isArchived
                ? 'border-primaryColor text-primaryColor'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            Active
          </button>
          <button
            onClick={() => {
              setIsArchived(true)
              setPage(1)
              setStatus(null)
            }}
            className={cn(
              'px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2',
              isArchived
                ? 'border-primaryColor text-primaryColor'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            Archived
          </button>
        </div>
      </When>

      <div className='bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm'>
        <Spin spinning={loading} indicator={<Spinner loading />}>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <React.Fragment key={headerGroup.id}>
                    <SortableHeader
                      headerGroup={headerGroup}
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <PatientTableFilters
                      headerGroup={headerGroup}
                      search={search}
                      setSearch={setSearch}
                      onSearch={handleSearch}
                      customerMappedId={customerMappedId}
                      setCustomerMappedId={setCustomerMappedId}
                      setClinicId={setClinicId}
                      setProductId={setProductId}
                      setCaseType={setCaseType}
                      setStatus={setStatus}
                      practiceLocationsList={practiceLocationsList}
                      productList={enabledProductOptions}
                    />
                  </React.Fragment>
                ))}
              </thead>
              <PatientTableBody rows={table.getRowModel().rows} columnCount={columns.length} />
            </table>
          </div>
        </Spin>

        <PatientListPagination
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          showRowSelector={showRowSelector}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}

export default PatientListV3
