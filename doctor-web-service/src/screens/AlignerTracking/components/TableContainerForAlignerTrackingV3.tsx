import When from 'components/when/When'
import {useMemo, useState, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cn from '@utils/cn'
import {useNavigate, useSearchParams} from 'react-router-dom'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import useActiveProfile from '@hooks/useActiveProfile'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import moment from 'moment'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import PatientGroupIcon from 'assets/icons/PatientGroupIcon'
import {
  assignPracticeToPatient,
  setIsAssignPracticeDrawerOpen,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {Formik} from 'formik'
import assignPracticeFormValidation from 'screens/Patients/LeadsProfile/leftPanel/assignPracticeForm.validation'
import useDispatchAction from '@hooks/useDispatchAction'
import {getFirstLetterCapitalOfWord, safeParseInt, getImageUrlById} from 'utils/ConstFunctions'
import {AxiosError} from 'axios'
import {eventEmitter} from '@utils/eventEmitter'
import alertType from '@constants/alertType'
import CustomDrawer from 'components/drawer/CustomDrawer'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useMediaQuery} from 'react-responsive'
import AssignPracticeForm from 'screens/Patients/LeadsProfile/leftPanel/AssignPracticeForm'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import type {Updater} from '@tanstack/react-table'
import PATIENT_TYPE from '@constants/patientType.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import GetAppInviteStatus from 'screens/Patients/PatientList/components/GetAppInviteStatus'
import GetPatientTreatmentStage from 'screens/Patients/PatientList/components/GetPatientTreatmentStage'
import GetPatientTreatmentStageForOrg from 'screens/Patients/PatientList/components/GetPatientTreatmentStageForOrg'
import PatientListMobileView from 'screens/Patients/PatientList/PatientListMobileView'
import {PatientRowDetails} from 'screens/Patients/PatientList/types/patientsList.types'
import {ChevronUp, ChevronDown, ChevronsUpDown} from 'lucide-react'
import TrackingTableFiltersV3 from './TrackingTableFiltersV3'
import filterPatientList from '@constants/filterPatientList'

const TableContainerForAlignerTrackingV3 = ({
  search,
  isArchived = false,
  pageNumber,
  handleOnSearch,
  appInviteStatusAccess,
}: {
  search: string | null
  setSearch: (val: string | null) => void
  isArchived?: boolean
  pageNumber: number
  handleOnSearch: ({
    page,
    search,
    statusFilters,
    clinicIdParams,
  }: {
    page: number
    search: string | null
    statusFilters?: keyof typeof filterPatientList | 'ALL'
    clinicIdParams?: number | null
  }) => void
  appInviteStatusAccess: boolean
}) => {
  const {dataPatientsList, loadingPatients, statusFilter, practiceLocationForOrg} = useSelector(
    (state: RootState) => state.patientsList
  )
  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)
  const {isAssignPracticeDrawerOpen} = useSelector((state: RootState) => state.leadsProfile)
  const {activeProfile} = useActiveProfile()
  const {
    isOrganization,
    isPractice,
    isDesignLabUser,
    isVendor,
    isEnterprisePlanUser,
    isAlignerCompanyOrg,
  } = useAllUserPlan()

  const pagination = dataPatientsList?.pagination_details
  const patientList = dataPatientsList.patient_details
  const navigation = useNavigate()
  const total_patients = pagination?.total_patients
  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const {dispatchAction} = useDispatchAction()
  const [patientId] = useState(0)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

  // Filter States
  const [nameSearch, setNameSearch] = useState<string | null>(search)
  const [customPatientIdFilter, setCustomPatientIdFilter] = useState<string | null>(null)
  const [appInviteStatusFilter, setAppInviteStatusFilter] = useState<
    keyof typeof filterPatientList | 'ALL'
  >(statusFilter || 'ALL')
  const [clinicIdFilter, setClinicIdFilter] = useState<number | null>(
    practiceLocationForOrg || null
  )

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting(updater)
  }

  const {permissionChecks} = useFeatureAccess()
  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'
  const isCustomerList = searchParams.get('isCustomerList') === 'true'
  const practiceLocationPermissions =
    !!permissionChecks?.practiceLocation?.managePracticeLocations?.isViewable
  const patientListAccessForLabs =
    (!isEnterprisePlanUser && isDesignLabUser) || isVendor || isCustomerList

  // Update effect to synchronize local states with props or redux
  useEffect(() => {
    // If external search is cleared (e.g., reset), clear local states
    if (!search) {
      setNameSearch(null)
      setCustomPatientIdFilter(null)
    } else if (!nameSearch && !customPatientIdFilter) {
      // In case search was populated externally, default to name search
      setNameSearch(search)
    }
  }, [search])

  useEffect(() => {
    setAppInviteStatusFilter(statusFilter || 'ALL')
  }, [statusFilter])

  useEffect(() => {
    setClinicIdFilter(practiceLocationForOrg || null)
  }, [practiceLocationForOrg])

  const triggerSearch = (
    searchOverride?: string | null,
    statusOverride?: keyof typeof filterPatientList | 'ALL',
    clinicOverride?: number | null
  ) => {
    handleOnSearch({
      page: 1,
      search: searchOverride !== undefined ? searchOverride : nameSearch || customPatientIdFilter,
      statusFilters: statusOverride !== undefined ? statusOverride : appInviteStatusFilter,
      clinicIdParams: clinicOverride !== undefined ? clinicOverride : clinicIdFilter,
    })
  }

  const columns = useMemo<ColumnDef<PatientRowDetails>[]>(
    () => [
      {
        id: 'patient_id',
        accessorKey: 'patient_id',
        enableSorting: true,
        header: 'Patient',
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          const profile_url = row?.original?.profile_image_id
            ? getImageUrlById(row?.original?.profile_image_id)
            : row?.original?.profile_url
          return (
            <RenderCell>
              <div className='flex gap-2 items-center'>
                {hasValue(profile_url) ? (
                  <Image
                    className='w-11 h-11 object-cover rounded-full'
                    src={profile_url}
                    showLoading={true}
                  />
                ) : (
                  <DefaultImage letter={row.original.full_name?.charAt(0)} />
                )}
                <div>
                  <div className='text-sm font-medium text-black'>{row.original.full_name}</div>
                  <div className='text-sm font-normal text-textColor'>
                    {row.original.age && `${row.original.age}y`}
                    {row.original.gender &&
                      `${row.original.age ? ', ' : ''}${getFirstLetterCapitalOfWord(
                        row.original.gender
                      )}`}
                  </div>
                </div>
              </div>
            </RenderCell>
          )
        },
        size: 250,
      },
      {
        id: 'custom_patient_id',
        accessorKey: 'custom_patient_id',
        enableSorting: true,
        header: 'ID',
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          const idToDisplay =
            (row.original as any).customer_mapped_id || row.original.custom_patient_id
          return (
            <RenderCell>
              <div className='text-sm font-normal text-textColor uppercase'>{idToDisplay}</div>
            </RenderCell>
          )
        },
        size: 250,
      },
      ...(practiceLocationPermissions
        ? [
            {
              id: 'practice_location_name',
              accessorKey: 'practice_location_name',
              enableSorting: true,
              header: 'Practice location',
              cell: ({row}: {row: Row<PatientRowDetails>}) => {
                return (
                  <RenderCell>
                    <div className='text-sm text-textColor font-medium'>
                      {row?.original?.practice_location_name ?? '-'}
                    </div>
                  </RenderCell>
                )
              },
              size: 150,
            },
          ]
        : []),
      ...(appInviteStatusAccess
        ? [
            {
              id: 'app_invite_status',
              accessorKey: 'app_invite_status',
              enableSorting: true,
              header: 'App invite status',
              cell: ({row}: {row: Row<PatientRowDetails>}) => {
                return (
                  <RenderCell>
                    {GetAppInviteStatus({
                      app_invite_status: row.original?.app_invite_status,
                    })}
                  </RenderCell>
                )
              },
              size: 100,
            },
          ]
        : []),
      {
        id: 'treatment_stage',
        accessorKey: 'treatment_stage',
        enableSorting: false,
        header: 'Treatment stage',
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              <div className='flex justify-between items-start w-full text-center '>
                {isAlignerCompanyOrg || isPractice
                  ? GetPatientTreatmentStageForOrg(row?.original, isArchived)
                  : GetPatientTreatmentStage(row?.original, isArchived)}
              </div>
            </RenderCell>
          )
        },
        size: 120,
      },
      {
        id: 'added_on',
        accessorKey: 'added_on',
        enableSorting: true,
        header: isArchived ? 'Archived on' : 'Added on',
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              <div className='flex-col text-textColor justify-start items-center text-sm  min-w-[90px] font-medium gap-1'>
                {isArchived ? (
                  <div className='text-sm font-medium'>
                    {hasValue(row.original?.archived_on)
                      ? moment(row.original?.archived_on).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                ) : (
                  <div className='text-sm font-medium'>
                    {hasValue(row.original?.added_on)
                      ? moment(row.original?.added_on).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                )}
                <When isTrue={!isCustomerList}>
                  {isOrganization && (
                    <div className='text-textColor font-normal'>
                      {row?.original?.patient_belongs_to === 'ORG_PATIENT' ||
                      row?.original?.patient_belongs_to === 'ASSIGNED_TO_PRACTICE'
                        ? 'by You'
                        : 'by Practice'}
                    </div>
                  )}
                  {isPractice && (
                    <div className='text-textColor font-normal'>
                      {row?.original?.patient_belongs_to === 'ASSIGNED_TO_PRACTICE'
                        ? `by ${activeProfile?.owner_organization_name ?? '-'}`
                        : 'by You'}
                    </div>
                  )}
                </When>
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },
    ],
    [patientList, isFiltered, patientListAccessForLabs, isCustomerList]
  )

  const filteredPatientList = useMemo(() => {
    return Array.isArray(patientList) ? patientList : []
  }, [patientList])

  const tableOptions = useMemo(() => {
    return {
      columns,
      data: filteredPatientList,
      state: {sorting},
      onSortingChange: handleSortingChange,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getCoreRowModel: getCoreRowModel(),
      defaultColumn: {
        size: 150,
        minSize: 50,
        enableSorting: true,
      },
    }
  }, [columns, filteredPatientList])

  const table = useReactTable(tableOptions)

  return (
    <div className='md:w-full flex flex-col mb-2 bg-white flex-1'>
      <When isTrue={isModalConnectWithPatientOpen}>
        <ModalConnectWithPatient />
      </When>
      <Formik
        initialValues={{
          practice_profile_id: null as number | null,
        }}
        validationSchema={assignPracticeFormValidation}
        enableReinitialize
        validateOnMount
        onSubmit={async (values) => {
          await dispatchAction(
            assignPracticeToPatient({
              patient_id: safeParseInt(patientId),
              practice_profile_id: safeParseInt(values.practice_profile_id),
            })
          )
            .unwrap()
            .then(() => {
              triggerSearch()
            })
            .catch((error: AxiosError) => {
              eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
            })
          dispatchAction(setIsAssignPracticeDrawerOpen(false))
        }}
      >
        {(formik) => {
          return (
            <CustomDrawer
              {...{
                title: 'Assign practice',
                subTitle: 'Search or select a practice from the dropdown.',
                width: !isMobile ? '700' : '100%',
                open: isAssignPracticeDrawerOpen,
                placement: isMobile ? 'bottom' : undefined,

                height: '90%',
                destroyOnClose: true,
                onClose: () => {
                  dispatchAction(setIsAssignPracticeDrawerOpen(false))
                  formik.resetForm()
                },
              }}
              footer={
                <div className='flex gap-3 w-full md:w-auto justify-end'>
                  <AntdButton
                    className=' hover:!bg-white !bg-white hover:!text-textColor h-10 font-semibold text-base w-fit border !border-mediumGray !text-textColor'
                    isLoading={false}
                    text='Cancel'
                    onClick={() => {
                      formik.resetForm()
                      dispatchAction(setIsAssignPracticeDrawerOpen(false))
                    }}
                  />
                  <AntdButton
                    className='bg-primaryColor text-white h-10 font-semibold text-base w-fit'
                    isLoading={formik.isSubmitting}
                    disabled={!formik.isValid}
                    text='Assign practice'
                    htmlType='submit'
                    onClick={() => {
                      formik.handleSubmit()
                    }}
                  />
                </div>
              }
            >
              <AssignPracticeForm />
            </CustomDrawer>
          )
        }}
      </Formik>
      <Spin indicator={<Spinner loading />} spinning={loadingPatients}>
        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm pt-2'>
          {/* Web */}
          <div className='md:inline-block hidden w-full h-full overflow-x-auto'>
            <table className='table-auto w-full h-full text-left'>
              <thead>
                {table?.getHeaderGroups()?.map((headerGroup, index: number) => (
                  <tr key={`header-${index}`} className='border-b border-gray-200'>
                    {headerGroup?.headers.map((header, idx: number) => {
                      const isSortable = header.column.getCanSort()
                      const sortStatus = header.column.getIsSorted()
                      return (
                        <th
                          key={`th-${idx}`}
                          colSpan={header.colSpan}
                          className={cn(
                            'py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider',
                            isSortable &&
                              'cursor-pointer select-none hover:bg-gray-50 transition-colors'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className='flex items-center gap-1'>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {isSortable && (
                              <span className='inline-flex ml-1'>
                                {sortStatus ? (
                                  sortStatus === 'desc' ? (
                                    <ChevronDown size={14} className='text-primaryColor' />
                                  ) : (
                                    <ChevronUp size={14} className='text-primaryColor' />
                                  )
                                ) : (
                                  <ChevronsUpDown size={14} className='text-gray-400' />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
                {table?.getHeaderGroups()?.map((headerGroup) => (
                  <TrackingTableFiltersV3
                    key={`filters-${headerGroup.id}`}
                    headerGroup={headerGroup}
                    searchName={nameSearch}
                    setSearchName={setNameSearch}
                    onSearch={(val) => triggerSearch(val)}
                    customPatientId={customPatientIdFilter}
                    setCustomPatientId={setCustomPatientIdFilter}
                    appInviteStatus={appInviteStatusFilter}
                    setAppInviteStatus={setAppInviteStatusFilter}
                    onAppInviteStatusChange={(val) => triggerSearch(undefined, val)}
                    clinicId={clinicIdFilter}
                    setClinicId={(val) => {
                      setClinicIdFilter(val)
                      triggerSearch(undefined, undefined, val)
                    }}
                    practiceLocationsList={practiceLocationsList}
                    practiceLocationPermissions={practiceLocationPermissions}
                    appInviteStatusAccess={appInviteStatusAccess}
                  />
                ))}
              </thead>

              {/* Empty State */}
              {table.getRowModel().rows?.length > 0 ? (
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    const patientType = row.original.patient_type
                    const belongsTo = row.original.patient_belongs_to
                    const patientId = row.original.patient_id
                    const isTrackingAdded = row.original.is_tracking_added

                    const handleRowClick = () => {
                      if (
                        isOrganization &&
                        patientType === PATIENT_TYPE.EXISTING_PATIENT &&
                        belongsTo === 'ASSIGNED_TO_PRACTICE' &&
                        isTrackingAdded
                      ) {
                        navigation(`/profile/${patientId}`)
                      } else if (isOrganization && patientType === PATIENT_TYPE.EXISTING_PATIENT) {
                        navigation(`/add_patient/existing_case/${patientId}`)
                      } else if (
                        isPractice &&
                        patientType === PATIENT_TYPE.EXISTING_PATIENT &&
                        belongsTo === 'ASSIGNED_TO_PRACTICE' &&
                        !isTrackingAdded
                      ) {
                        navigation(`/add_patient/existing_case/${patientId}`)
                      } else {
                        navigation(`/profile/${patientId}/aligner-tracking`)
                      }
                    }

                    return (
                      <tr
                        key={row.id}
                        className='border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer text-black text-base'
                        onClick={handleRowClick}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className='px-4 py-4'>
                            <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td
                      colSpan={table.getHeaderGroups()[0]?.headers?.length}
                      className='text-center py-4 text-textColor'
                    >
                      {hasValue(search) ? (
                        'No matching patients found. Please try refining your search criteria'
                      ) : (
                        <CommonEmptyState
                          boxStyle='text-center flex justify-center items-center min-h-[60dvh]'
                          titleStyle='text-[20px] font-semibold md:mt-7 text-black'
                          subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4'
                          subTitle='No records found.'
                          onClick={() => navigation('/add-patient')}
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          {/* Mobile */}
          <When isTrue={isMobile}>
            {hasValue(table.getRowModel().rows.map((row) => row.original)) ? (
              <div className='w-full h-full'>
                {table
                  .getRowModel()
                  .rows.map((row) => row.original)
                  .map((listItem: PatientRowDetails) => {
                    return (
                      <PatientListMobileView
                        key={listItem.patient_id}
                        patientObject={listItem}
                        isArchived={isArchived}
                      />
                    )
                  })}
              </div>
            ) : (
              <div className='text-center py-4 w-full h-full'>
                {hasValue(search) ? (
                  <div className='w-full flex flex-col gap-3 text-textColor text-base justify-center items-center h-full'>
                    <div className='p-3 rounded-full w-full h-fit bg-lighterGray'>
                      <PatientGroupIcon color='#666666' width='32' height='32' />
                    </div>
                    <p>No patients present</p>
                  </div>
                ) : (
                  <CommonEmptyState
                    boxStyle='text-center flex justify-center items-center h-[60dvh]'
                    titleStyle='text-[20px] font-semibold md:mt-7 text-black'
                    subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4'
                    subTitle='Details will be available when aligners are delivered'
                    onClick={() => navigation('/add-patient')}
                  />
                )}
              </div>
            )}
          </When>

          <div className='flex justify-between md:px-6 px-4 py-4 items-center bg-white border-t border-gray-200'>
            <p className='text-textColor text-sm font-medium'>
              Showing {Math.min((pageNumber - 1) * 10 + 1, total_patients)}-
              {Math.min(pageNumber * 10, total_patients)} from {total_patients}
            </p>
            <Pagination
              showSizeChanger={false}
              current={pageNumber} // Use the current page number
              defaultPageSize={10}
              onChange={(page) => {
                handleOnSearch({
                  page: page,
                  search: null,
                })
              }}
              total={total_patients}
            />
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForAlignerTrackingV3
