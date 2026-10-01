import When from 'components/when/When'
import {useEffect, useMemo, useState} from 'react'
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
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import useActiveProfile from '@hooks/useActiveProfile'
import {PatientBelongsTo, PatientRowDetails} from '../types/patientsList.types'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import moment from 'moment'
import GetAppInviteStatus from './GetAppInviteStatus'
import GetPatientTreatmentStage from './GetPatientTreatmentStage'
import PatientListMobileView from './PatientListMobileView'
import useProfileBasePath from '@hooks/useProfileBasePath'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
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
import treatmentTypeMain from '@constants/treatmentTypeMain'
import type {Updater} from '@tanstack/react-table'
import GetPatientTreatmentStageForOrg from './GetPatientTreatmentStageForOrg'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useSubRoleDetails from '@hooks/useSubRoleDetails'

// === Equal width config (use minWidth so table still stretches to full width) ===
const EQUAL_COL_SIZE = 150
const EQUAL_IDS = new Set([
  'patient_id', // Patient (shows name)
  'customer_patient_id', // customer_mapped_id / ID
  'practice_location_name', // Clinic
  'created_by', // Created by
  'added_on', // Created On
  'assigned_practice_name', // Assigned practice name
  'archived_on', // Archived On
  'app_invite_status', // App Invite status
])

export type TableContainerForPatientListProps = {
  search: string | null
  isArchived?: boolean
  pageNumber: number
  handleOnSearch: ({page, search}: {page: number; search: string | null}) => void
  hideCreatedByColumn?: boolean
}

const TableContainerForPatientList = ({
  search,
  isArchived = false,
  pageNumber,
  handleOnSearch,
  hideCreatedByColumn,
}: TableContainerForPatientListProps) => {
  const {dataPatientsList, loadingPatients} = useSelector((state: RootState) => state.patientsList)
  const {isAssignPracticeDrawerOpen} = useSelector((state: RootState) => state.leadsProfile)
  const {activeProfile} = useActiveProfile()
  const {isAdmin} = useSubRoleDetails()
  const location = useLocation()
  const practice_profile_routes =
    location.pathname.includes('practice-profile') ||
    location.pathname.includes('practice-lab-profile')

  const {
    isOrganization: org,
    isPractice,
    isCustomer,
    isDesignLabUser,
    isVendor,
    isEnterprisePlanUser: enterpriseUser,
    isAlignerCompanyOrg: alignerOrg,
    isProfessionalPlanUser,
    isGrowthPlanUser,
  } = useAllUserPlan()
  const isEnterprisePlanUser = enterpriseUser || isAdmin
  const isAlignerCompanyOrg = alignerOrg || isAdmin
  const isOrganization = org || isAdmin
  const pagination = dataPatientsList?.pagination_details
  const patientList =
    (isPractice || isAlignerCompanyOrg || isGrowthPlanUser) && !isArchived
      ? dataPatientsList.patient_details
      : dataPatientsList?.patients
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()
  const total_patients = pagination?.total_patients

  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const {dispatchAction} = useDispatchAction()
  const [patientId] = useState<number>(0)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting(updater)
  }

  const {permissionChecks} = useFeatureAccess()
  const practice = permissionChecks?.customerManagement?.customerManagement
  const isAccessible = practice?.isEditable ?? false
  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'
  const isCustomerList = searchParams.get('isCustomerList') === 'true'
  const isAssessButtonBasedOnRole = (patient_belongs_to: PatientBelongsTo) => {
    const access =
      (patient_belongs_to === 'ORG_PATIENT' && isOrganization) ||
      (patient_belongs_to === 'ASSIGNED_TO_PRACTICE' &&
        !isOrganization &&
        !isDesignLabUser &&
        !isVendor) ||
      (patient_belongs_to === 'ORTHODONTIC_PATIENT' &&
        !isOrganization &&
        !isDesignLabUser &&
        !isVendor)

    return access
  }
  const patientListAccessForLabs = isEnterprisePlanUser || isCustomerList

  const columns = useMemo<ColumnDef<PatientRowDetails>[]>(() => {
    const baseColumns: ColumnDef<PatientRowDetails>[] = [
      {
        id: 'patient_id',
        accessorKey: 'patient_id',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Patient</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            <div className='flex gap-2 items-center min-w-0'>
              {hasValue(
                row?.original?.profile_image_id
                  ? getImageUrlById(row?.original?.profile_image_id)
                  : row?.original?.profile_url
              ) ? (
                <Image
                  className='w-11 h-11 object-cover rounded-full'
                  src={
                    row?.original?.profile_image_id
                      ? getImageUrlById(row?.original?.profile_image_id)
                      : row?.original?.profile_url
                  }
                  showLoading={true}
                />
              ) : (
                <DefaultImage letter={row.original.full_name?.charAt(0)} />
              )}
              <div className='min-w-0'>
                <div className='text-sm font-medium text-black truncate'>
                  {row.original.full_name}
                </div>
                <div className='text-sm font-medium text-black truncate'>
                  {[
                    row.original.gender
                      ? row.original.gender.charAt(0).toUpperCase() +
                        row.original.gender.slice(1).toLowerCase()
                      : '',
                    row.original.age ? `${row.original.age}y` : '',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>

                <When
                  isTrue={!isArchived && isAssessButtonBasedOnRole(row.original.patient_belongs_to)}
                >
                  <div className='text-sm font-normal text-textColor uppercase truncate'>
                    {row.original.custom_patient_id}
                  </div>
                </When>
              </div>
            </div>
          </RenderCell>
        ),
        size: EQUAL_COL_SIZE,
      },
      {
        id: 'customer_patient_id',
        accessorKey: 'custom_patient_id',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>ID</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            <div className='text-sm text-textColor font-medium truncate'>
              {(() => {
                if (isArchived) {
                  return row.original.customer_mapped_id ?? row.original.custom_patient_id ?? '-'
                }
                if (!isGrowthPlanUser && !isEnterprisePlanUser) {
                  return row.original.custom_patient_id ?? row.original.customer_mapped_id ?? '-'
                }
                return row.original.customer_mapped_id ?? row.original.custom_patient_id ?? '-'
              })()}
            </div>
          </RenderCell>
        ),
        size: EQUAL_COL_SIZE,
      },
      {
        id: 'email',
        accessorKey: 'email',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Contact</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            <When isTrue={isAssessButtonBasedOnRole(row.original.patient_belongs_to)}>
              {hasValue(row.original.email || row.original?.mobile) ? (
                <div className='min-w-0'>
                  <div className='text-sm text-textColor font-medium truncate'>
                    {row.original?.email?.toLocaleLowerCase()}
                  </div>
                  <div className='text-sm text-textColor font-medium truncate'>
                    {row.original?.mobile && row.original?.country_code} {row.original?.mobile}
                  </div>
                </div>
              ) : (
                '-'
              )}
            </When>
          </RenderCell>
        ),
        size: 150,
      },
      // {
      //   id: 'assigned_practice',
      //   accessorKey: 'assigned_practice',
      //   enableSorting: true,
      //   header: () => (
      //     <RenderTableHeader
      //       {...{
      //         className: 'w-full font-medium text-xs',
      //         header: (
      //           <div className='flex justify-between items-center w-full'>Assigned practice</div>
      //         ),
      //       }}
      //     />
      //   ),
      //   cell: ({row}: any) => (
      //     <div className='flex gap-2 justify-start items-center h-11 truncate'>
      //       {row?.original?.patient_type === PATIENT_TYPE.EXISTING_PATIENT ? (
      //         <span className='text-black'>-</span>
      //       ) : (
      //         <AssignPracticeButton
      //           patientBelongsTo={row?.original?.patient_belongs_to}
      //           practiceName={
      //             row?.original?.assigned_practice?.name ??
      //             row?.original?.assigned_practice?.practice_name
      //           }
      //         />
      //       )}
      //     </div>
      //   ),
      //   size: 150,
      // },
      {
        id: 'practice_location_name',
        accessorKey: 'practice_location_name',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Clinic</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            <div className='text-sm text-textColor font-medium truncate'>
              {row?.original?.practice_location_name ?? '-'}
            </div>
          </RenderCell>
        ),
        size: EQUAL_COL_SIZE,
      },
      ...(!isAlignerCompanyOrg && !isPractice
        ? [
            {
              id: 'treatment_type',
              accessorKey: 'treatment_type',
              enableSorting: true,
              header: () => (
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-between items-center w-full'>
                        <p>Treatment type</p>
                      </div>
                    ),
                  }}
                />
              ),
              cell: ({row}: {row: Row<PatientRowDetails>}) => (
                <RenderCell>
                  {isPractice || isAlignerCompanyOrg ? (
                    <div className='h-11 flex text-textColor justify-center items-center text-sm min-w-[98px] gap-2'>
                      {row.original?.treatment_type ? (
                        <div className='p-[6px] px-[12px] bg-secondarySupport text-secondaryColor flex justify-center items-center font-semibold text-sm rounded-md'>
                          {getFirstLetterCapitalOfWord(row.original?.treatment_type)}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                  ) : (
                    <div className='h-11 flex text-textColor justify-center items-center text-sm min-w-[98px] gap-2'>
                      {hasValue(row?.original?.treatments) ? (
                        row?.original?.treatments
                          .filter((product_type: string) => product_type !== 'UNASSIGNED')
                          .map((product_type: string) => (
                            <div key={product_type}>
                              <When isTrue={product_type !== treatmentTypeMain.BRACES}>
                                <div className='p-[6px] px-[12px] bg-primarySupport text-primaryColor flex justify-center items-center font-semibold text-sm rounded-md'>
                                  {getFirstLetterCapitalOfWord(product_type)}
                                </div>
                              </When>
                              <When isTrue={product_type === treatmentTypeMain.BRACES}>
                                <div className='p-[6px] px-[12px] bg-secondarySupport text-secondaryColor flex justify-center items-center font-semibold text-sm rounded-md'>
                                  {getFirstLetterCapitalOfWord(product_type)}
                                </div>
                              </When>
                            </div>
                          ))
                      ) : (
                        <div className='text-sm font-semibold self-center items-center text-gray-500'>
                          -
                        </div>
                      )}
                      {row?.original?.treatments &&
                        row?.original?.treatments.length === 1 &&
                        row?.original?.treatments[0] === 'UNASSIGNED' && (
                          <div className='text-sm font-semibold self-center text-center text-gray-500'>
                            -
                          </div>
                        )}
                    </div>
                  )}
                </RenderCell>
              ),
              size: 100,
            },
          ]
        : []),
      {
        id: 'treatment_stage',
        accessorKey: 'treatment_stage',
        enableSorting: false,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Treatment stage</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            <div className='flex justify-between items-start w-full text-center'>
              {isAlignerCompanyOrg || isPractice
                ? GetPatientTreatmentStageForOrg(row?.original, isArchived)
                : GetPatientTreatmentStage(row?.original, isArchived)}
            </div>
          </RenderCell>
        ),
        size: 120,
      },
      {
        id: 'customer',
        accessorKey: 'customer',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Customer</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              {isArchived ? (
                <div>
                  {!!row?.original?.assigned_practice?.name
                    ? row?.original?.assigned_practice?.name
                    : '-'}
                </div>
              ) : (
                <div>
                  {!!row?.original?.assigned_practice?.practice_name
                    ? row?.original?.assigned_practice?.practice_name
                    : '-'}
                </div>
              )}
            </RenderCell>
          )
        },
        size: EQUAL_COL_SIZE,
      },
      {
        id: 'created_by',
        accessorKey: 'created_by',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Created By</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              <div className='px-2 py-2 rounded-full text-sm font-medium w-fit bg-lightGray text-black truncate'>
                {row?.original?.created_by}
              </div>
            </RenderCell>
          )
        },
        size: EQUAL_COL_SIZE,
      },
      {
        id: 'added_on',
        accessorKey: 'added_on',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Created On</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            <div className='flex-col text-textColor justify-start items-center text-sm min-w-[90px] font-medium gap-1'>
              <div className='text-sm font-medium'>
                {hasValue(row.original?.added_on)
                  ? moment(row.original?.added_on).format('MMM D, YYYY')
                  : '-'}
              </div>
            </div>
          </RenderCell>
        ),
        size: EQUAL_COL_SIZE,
      },
      {
        id: 'archived_on',
        accessorKey: 'archived_on',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Archived On</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            <div className='text-sm font-medium text-textColor min-w-[90px]'>
              {hasValue(row.original?.archived_on)
                ? moment(row.original?.archived_on).format('MMM D, YYYY')
                : '-'}
            </div>
          </RenderCell>
        ),
        size: EQUAL_COL_SIZE,
      },
      {
        id: 'app_invite_status',
        accessorKey: 'app_invite_status',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>App invite status</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => (
          <RenderCell>
            {GetAppInviteStatus({
              app_invite_status: row.original?.app_invite_status,
            })}
          </RenderCell>
        ),
        size: EQUAL_COL_SIZE,
      },
    ]

    if (isGrowthPlanUser) {
      return baseColumns.filter((column) => column.id !== 'customer')
    }

    if (isEnterprisePlanUser) {
      const customerColumn = baseColumns.find((column) => column.id === 'customer')
      let hasInsertedCustomer = false

      const reorderedColumns: ColumnDef<PatientRowDetails>[] = []

      baseColumns.forEach((column) => {
        if (column.id === 'customer') {
          return
        }

        reorderedColumns.push(column)

        if (!hasInsertedCustomer && column.id === 'practice_location_name' && customerColumn) {
          reorderedColumns.push(customerColumn)
          hasInsertedCustomer = true
        }
      })

      if (customerColumn && !hasInsertedCustomer) {
        reorderedColumns.push(customerColumn)
      }

      return reorderedColumns
    }

    return baseColumns
  }, [
    patientList,
    isFiltered,
    patientListAccessForLabs,
    isAccessible,
    isCustomerList,
    isArchived,
    activeProfile,
    isOrganization,
    isPractice,
    isEnterprisePlanUser,
    isDesignLabUser,
    isVendor,
    isGrowthPlanUser,
  ])

  const tableOptions = useMemo(() => {
    return {
      columns,
      data: Array.isArray(patientList) ? patientList : [],
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
  }, [columns, patientList, sorting, handleSortingChange])

  const table = useReactTable(tableOptions)

  useEffect(() => {
    table.setColumnVisibility({
      assigned_practice: isAccessible && !isCustomerList,
      practice_location_name: !patientListAccessForLabs && !isProfessionalPlanUser,
      app_invite_status:
        (patientListAccessForLabs || isPractice || isGrowthPlanUser) &&
        !isArchived &&
        !hideCreatedByColumn,
      treatment_type:
        !patientListAccessForLabs &&
        !isCustomer &&
        !isPractice &&
        !isGrowthPlanUser &&
        !isEnterprisePlanUser,
      treatment_stage:
        !patientListAccessForLabs &&
        !isCustomer &&
        !isOrganization &&
        !isGrowthPlanUser &&
        !isEnterprisePlanUser &&
        !isPractice,
      email:
        !isOrganization &&
        !patientListAccessForLabs &&
        !isGrowthPlanUser &&
        !isEnterprisePlanUser &&
        !isCustomer &&
        !isPractice,
      added_on: ((!patientListAccessForLabs || isCustomerList) && !isOrganization) || isArchived,
      archived_on: isArchived,
      customer: isGrowthPlanUser
        ? false
        : !isGrowthPlanUser && hideCreatedByColumn
          ? !hideCreatedByColumn
          : patientListAccessForLabs || isEnterprisePlanUser,
    })
  }, [
    table,
    patientListAccessForLabs,
    isCustomerList,
    isOrganization,
    isPractice,
    isCustomer,
    isAccessible,
    isProfessionalPlanUser,
    isEnterprisePlanUser,
    isGrowthPlanUser,
    isArchived,
  ])

  return (
    <div className='md:w-full flex flex-col card-wrapper mb-2 md:h-[calc(100vh-6rem)]'>
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
              handleOnSearch({page: pageNumber, search: null})
            })
            .catch((error: AxiosError) => {
              eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
            })
          dispatchAction(setIsAssignPracticeDrawerOpen(false))
        }}
      >
        {(formik) => (
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
        )}
      </Formik>
      <Spin indicator={<Spinner loading />} spinning={loadingPatients}>
        <div className='md:w-full h-full md:border border-mediumGray rounded-lg '>
          {/* Web */}
          <div className='md:inline-block hidden w-full h-full overflow-x-auto'>
            {/* NOTE: no table-fixed, no colgroup so width fills container */}
            <table className='table-auto w-full curved-table h-full'>
              <thead className='bg-mediumGray'>
                {table?.getHeaderGroups()?.map((headerGroup, index: number) => (
                  <tr key={index}>
                    {headerGroup?.headers.map((header, hIndex: number) => (
                      <th
                        key={hIndex}
                        colSpan={header.colSpan}
                        className='text-start text-black text-xs font-medium py-2 px-2 h-10 uppercase'
                        style={{
                          minWidth: EQUAL_IDS.has(header.column.id) ? EQUAL_COL_SIZE : undefined,
                        }}
                      >
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none text-xs'
                              : 'text-xs'
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div
                            className={cn(
                              'flex gap-2 w-full',
                              header.column.getIsLastColumn() ? '' : 'border-r-2 border-mediumGray'
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <div className='mr-2'>
                              {
                                {
                                  asc: <ArrowUpDownIcon color1={'#666666'} color2={'#66666680'} />,
                                  desc: <ArrowUpDownIcon color2={'#666666'} color1={'#66666680'} />,
                                }[header.column.getIsSorted() as string]
                              }
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              {table.getRowModel().rows?.length > 0 ? (
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    const pid = row.original.patient_id

                    const handleRowClick = () => {
                      navigation(`${profileBasePath}/${pid}`)
                    }

                    return (
                      <tr
                        key={row.id}
                        className='border-b border-lightgray text-black text-base group cursor-pointer'
                        onClick={handleRowClick}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className='px-2 py-3'
                            style={{
                              minWidth: EQUAL_IDS.has(cell.column.id) ? EQUAL_COL_SIZE : undefined,
                            }}
                          >
                            <div className='min-w-0'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
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
                          image={IMAGE_EMPTY_STATE}
                          boxStyle='text-center'
                          title='No patient added'
                          titleStyle='text-[20px] font-semibold md:mt-7 text-black'
                          subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4'
                          buttonText={
                            !practice_profile_routes
                              ? permissionChecks?.patientManagement?.patientManagement?.isAddable
                                ? '+ Add a patient'
                                : null
                              : null
                          }
                          buttonStyle='mt-[13px] border border-primaryColor text-primaryColor font-semibold px-[85px] md:px-[20px] py-[10px] rounded-[8px] text-[16px]'
                          onClick={() => navigation('/add-patient')}
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              )}

              <tfoot className='border-t border-mediumGray'>
                <tr>
                  <td colSpan={table.getHeaderGroups()[0]?.headers?.length} className='text-center'>
                    <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                      <p className='text-textColor text-sm font-medium'>
                        {Math.min((pageNumber - 1) * 10 + 1, total_patients)}-
                        {Math.min(pageNumber * 10, total_patients)} from {total_patients}
                      </p>
                      <Pagination
                        showSizeChanger={false}
                        current={pageNumber}
                        defaultPageSize={10}
                        onChange={(page) => {
                          handleOnSearch({page, search: null})
                        }}
                        total={total_patients}
                      />
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile */}
          <When isTrue={isMobile}>
            {hasValue(table.getRowModel().rows.map((row) => row.original)) ? (
              <div className='w-full h-full'>
                {table
                  .getRowModel()
                  .rows.map((row) => row.original)
                  .map((listItem: PatientRowDetails) => (
                    <PatientListMobileView
                      key={listItem.patient_id}
                      patientObject={listItem}
                      isArchived={isArchived}
                    />
                  ))}
                <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                  <p className='text-textColor text-sm font-medium'>
                    {Math.min((pageNumber - 1) * 10 + 1, total_patients)}-
                    {Math.min(pageNumber * 10, total_patients)} from {total_patients}
                  </p>
                  <Pagination
                    showSizeChanger={false}
                    current={pageNumber}
                    defaultPageSize={10}
                    onChange={(page) => {
                      handleOnSearch({page, search: null})
                    }}
                    total={total_patients}
                  />
                </div>
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
                    image={IMAGE_EMPTY_STATE}
                    boxStyle='w-full text-center'
                    title='No patient added'
                    titleStyle='text-xl font-semibold md:mt-7'
                    subTitleStyle='md:w-[363px] text-base font-normal md:mt-4'
                    buttonText='+ Add a patient'
                    buttonStyle='mt-[13px] border border-primaryColor text-primaryColor font-semibold px-[85px] md:px-5 py-2 rounded-lg text-base'
                    onClick={() => navigation('/add-patient')}
                  />
                )}
              </div>
            )}
          </When>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForPatientList
