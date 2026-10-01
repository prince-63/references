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
import {useNavigate, useSearchParams} from 'react-router-dom'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import useActiveProfile from '@hooks/useActiveProfile'
import {PatientRowDetails} from '../Patients/PatientList/types/patientsList.types'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import moment from 'moment'
import GetAppInviteStatus from 'screens/Patients/PatientList/components/GetAppInviteStatus'
import GetPatientTreatmentStage from 'screens/Patients/PatientList/components/GetPatientTreatmentStage'
import PatientListMobileView from 'screens/Patients/PatientList/components/PatientListMobileView'
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
import {getFirstLetterCapitalOfWord, getImageUrlById, safeParseInt} from 'utils/ConstFunctions'
import {AxiosError} from 'axios'
import {eventEmitter} from '@utils/eventEmitter'
import alertType from '@constants/alertType'
import CustomDrawer from 'components/drawer/CustomDrawer'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useMediaQuery} from 'react-responsive'
import AssignPracticeForm from 'screens/Patients/LeadsProfile/leftPanel/AssignPracticeForm'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import type {Updater} from '@tanstack/react-table'
import GetPatientTreatmentStageForOrg from 'screens/Patients/PatientList/components/GetPatientTreatmentStageForOrg'
import PATIENT_TYPE from '@constants/patientType.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const TableContainerForPracticePatient = ({
  search,
  isArchived = false,
  pageNumber,
  handleOnSearch,
}: {
  search: string | null
  isArchived?: boolean
  pageNumber: number
  handleOnSearch: ({page, search}: {page: number; search: string | null}) => void
}) => {
  const {dataPatientsList, loadingPatients} = useSelector((state: RootState) => state.patientsList)
  const {isAssignPracticeDrawerOpen} = useSelector((state: RootState) => state.leadsProfile)
  const {activeProfile} = useActiveProfile()
  const {
    isOrganization,
    isPractice,
    isCustomer,
    isVendor,
    isEnterprisePlanUser,
    isAlignerCompanyOrg,
  } = useAllUserPlan()
  const pagination = dataPatientsList?.pagination_details
  const patientList =
    (isPractice || isAlignerCompanyOrg) && !isArchived
      ? dataPatientsList.patient_details
      : dataPatientsList?.patients
  const navigation = useNavigate()
  const total_patients = pagination?.total_patients

  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const {dispatchAction} = useDispatchAction()
  const [patientId] = useState(0)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting(updater)
  }
  const {permissionChecks} = useFeatureAccess()
  const patientManagementAccess = permissionChecks?.patientManagement?.patientManagement?.isAddable
  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'
  const isCustomerList = searchParams.get('isCustomerList') === 'true'

  const isAssessButtonBasedOnRole = (patient_belongs_to: string) => {
    const access =
      (patient_belongs_to === 'ORG_PATIENT' && isOrganization) ||
      (patient_belongs_to === 'ASSIGNED_TO_PRACTICE' && !isOrganization && !isVendor) ||
      (patient_belongs_to === 'ORTHODONTIC_PATIENT' && !isOrganization && !isVendor)

    return access
  }
  const patientListAccessForLabs = (!isEnterprisePlanUser && !isVendor) || isCustomerList
  const columns = useMemo<ColumnDef<PatientRowDetails>[]>(
    () => [
      {
        id: 'patient_id',
        accessorKey: 'patient_id',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Patient</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          const profile_url = row?.original?.profile_image_id
            ? getImageUrlById(row?.original?.profile_image_id)
            : row?.original?.profile_url
          return (
            <RenderCell>
              <div className='flex gap-2 items-center'>
                {hasValue(profile_url) ? (
                  <Image
                    className='w-16 h-16 object-cover rounded-full'
                    src={profile_url}
                    showLoading={true}
                  />
                ) : (
                  <DefaultImage letter={row.original.full_name?.charAt(0)} />
                )}
                <div>
                  <div className='text-sm font-medium text-black'>{row.original.full_name}</div>
                  <When
                    isTrue={
                      !row?.original?.has_read_existing_patient_form &&
                      row?.original?.patient_type === PATIENT_TYPE.EXISTING_PATIENT
                    }
                  >
                    <div className='flex gap-1 items-center'>
                      <div className='w-2 h-2 bg-orange rounded-full'></div>
                      <div className='font-figtree text-xs font-semibold leading-4 tracking-[0.12px] text-orange'>
                        Existing case
                      </div>
                    </div>
                  </When>
                  <When isTrue={isAssessButtonBasedOnRole(row.original.patient_belongs_to)}>
                    <div className='text-sm font-normal text-textColor uppercase'>
                      {row.original.custom_patient_id}
                    </div>
                  </When>
                </div>
              </div>
            </RenderCell>
          )
        },
        size: 250,
      },
      {
        id: 'email',
        accessorKey: 'email',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Contact</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              <When isTrue={isAssessButtonBasedOnRole(row.original.patient_belongs_to)}>
                {hasValue(row.original.email || row.original?.mobile) ? (
                  <div>
                    <div className='text-sm text-textColor font-medium'>
                      {row.original?.email?.toLocaleLowerCase()}
                    </div>
                    <div className='text-sm text-textColor font-medium'>
                      {row.original?.mobile && row.original?.country_code} {row.original?.mobile}
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </When>
            </RenderCell>
          )
        },
        size: 150,
      },

      {
        id: 'app_invite_status',
        accessorKey: 'app_invite_status',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>App invite status</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              {GetAppInviteStatus({
                app_invite_status: row.original?.app_invite_status,
                patientId: row.original.patient_id,
                isArchived: isArchived,
              })}
            </RenderCell>
          )
        },
        size: 100,
      },
      ...(!isAlignerCompanyOrg && !isPractice
        ? [
            {
              id: 'treatment_type',
              accessorKey: 'treatment_type',
              enableSorting: true,
              header: ({}) => (
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-between items-center w-full  '>
                        <p>Treatment type</p>
                      </div>
                    ),
                  }}
                />
              ),
              cell: ({row}: {row: Row<PatientRowDetails>}) => {
                return (
                  <RenderCell>
                    {isPractice || isAlignerCompanyOrg ? (
                      <div className='h-11 flex text-textColor justify-start items-center text-sm  min-w-[98px] gap-2 '>
                        {row.original?.treatment_type ? (
                          <div className='p-[6px] px-[12px] bg-secondarySupport text-secondaryColor flex justify-center items-center font-semibold text-sm rounded-md'>
                            {getFirstLetterCapitalOfWord(row.original?.treatment_type)}
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                    ) : (
                      <div className='h-11 flex text-textColor justify-start items-center text-sm  min-w-[98px] gap-2 '>
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
                          <div className='text-sm font-semibold text-gray-500'>-</div>
                        )}

                        {row?.original?.treatments &&
                          row?.original?.treatments.length === 1 &&
                          row?.original?.treatments[0] === 'UNASSIGNED' && (
                            <div className='text-sm font-semibold text-gray-500'>-</div>
                          )}
                      </div>
                    )}
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
        header: ({}) => (
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
        id: 'customer',
        accessorKey: 'customer',
        enableSorting: false,
        header: ({}) => (
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
              {isAlignerCompanyOrg || isPractice ? (
                <div className='flex justify-between items-start w-full text-center '>
                  {row.original?.assigned_practice?.practice_name ?? '-'}
                </div>
              ) : (
                <div className='flex justify-between items-start w-full text-center '>
                  {!isEnterprisePlanUser || isVendor
                    ? row.original?.assigned_practice?.customer_name
                    : (row.original?.assigned_practice?.name ?? '-')}
                </div>
              )}
            </RenderCell>
          )
        },
        size: 120,
      },
      {
        id: 'order',
        accessorKey: 'order',
        enableSorting: false,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>Orders</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              <div className='flex justify-between items-start w-full text-center '>
                {isAlignerCompanyOrg
                  ? row.original?.order_count
                  : (row.original?.assigned_practice?.order_count ?? 0)}
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
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  {isArchived ? 'Archived on' : 'Added on'}
                </div>
              ),
            }}
          />
        ),
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

  const tableOptions = useMemo(() => {
    return {
      columns,
      data: Array.isArray(patientList) ? patientList : [],
      state: {sorting},
      onSortingChange: handleSortingChange,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getCoreRowModel: getCoreRowModel(),
      // initialState: {
      //   columnVisibility: {
      //     assigned_practice: practicePermissions.isAccessible,
      //     practice_location_name: !patientListAccessForLabs && !isOrganization && !isCustomer,
      //     app_invite_status: !patientListAccessForLabs && !isCustomer,
      //     treatment_type: !patientListAccessForLabs && !isCustomer && !isPractice,
      //     treatment_stage: !patientListAccessForLabs && !isCustomer,
      //     email: !isOrganization && !patientListAccessForLabs,
      //     added_on: !patientListAccessForLabs,
      //     order: patientListAccessForLabs || isCustomer || isCustomerList,
      //     customer: patientListAccessForLabs || isCustomerList,
      //   },
      // },
      defaultColumn: {
        size: 150,
        minSize: 50,
        enableSorting: true,
      },
    }
  }, [
    columns,
    patientList,
    // sorting,
    // isOrganization,
    // isArchived,
    // isEnterprisePlanUser,
    // isFiltered,
    // patientListAccessForLabs,
    // isCustomerList,
    // practicePermissions.isAccessible,
  ])

  const table = useReactTable(tableOptions)

  useEffect(() => {
    table.setColumnVisibility({
      assigned_practice: !isCustomerList,
      practice_location_name: !patientListAccessForLabs && !isOrganization && !isCustomer,
      app_invite_status: !patientListAccessForLabs && !isCustomer,
      treatment_type: !patientListAccessForLabs && !isCustomer && !isPractice,
      treatment_stage: !patientListAccessForLabs && !isCustomer,
      email: !isOrganization && !patientListAccessForLabs,
      added_on: !patientListAccessForLabs || isCustomerList,
      order: patientListAccessForLabs || isCustomer,
      customer: patientListAccessForLabs,
    })
  }, [
    // table,
    patientListAccessForLabs,
    isCustomerList,
    isOrganization,
    isPractice,
    isCustomer,
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
              // DEBUG: Log handleOnSearch call from Formik submit
              handleOnSearch({page: pageNumber, search: null})
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
        <div className='md:w-full h-full md:border border-mediumGray rounded-lg '>
          {/* Web */}
          <div className='md:inline-block hidden w-full h-full overflow-x-auto'>
            <table className=' table-auto w-full curved-table h-full'>
              <thead className='bg-mediumGray'>
                {table?.getHeaderGroups()?.map((headerGroup, index: number) => (
                  <tr key={index}>
                    {headerGroup?.headers.map((header, index: number) => (
                      <th
                        key={index}
                        colSpan={header.colSpan}
                        className='text-start text-black text-xs font-medium py-2 px-2 h-10 uppercase'
                      >
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none text-xs '
                              : 'text-xs ',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          <div
                            className={cn(
                              'flex gap-2 w-full ',
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
                        navigation(`profile/${patientId}`)
                      } else if (isOrganization && patientType === PATIENT_TYPE.EXISTING_PATIENT) {
                        navigation(`/add_patient/existing_case/${patientId}`)
                      } else if (
                        isPractice &&
                        patientType === PATIENT_TYPE.EXISTING_PATIENT &&
                        belongsTo === 'ASSIGNED_TO_PRACTICE' &&
                        !isTrackingAdded
                      ) {
                        navigation(`/add_patient/existing_case/${patientId}`)
                      } else if (isArchived) {
                        navigation(`/leads-profile/${patientId}/files`)
                      } else {
                        navigation(`/profile/${patientId}`)
                      }
                    }

                    return (
                      <tr
                        key={row.id}
                        className='border-b border-lightgray text-black text-base group cursor-pointer'
                        onClick={handleRowClick}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className='px-2 py-3'>
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
                          image={IMAGE_EMPTY_STATE}
                          boxStyle='text-center'
                          title='No patient added'
                          titleStyle='text-[20px] font-semibold md:mt-7 text-black'
                          subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4'
                          buttonText={patientManagementAccess ? '+ Add a patient' : null}
                          buttonStyle='mt-[13px] border border-primaryColor text-primaryColor font-semibold px-[85px] md:px-[20px] py-[10px] rounded-[8px] text-[16px]'
                          onClick={() => navigation('/add-patient')}
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              )}

              {/* Footer */}
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
                  .map((listItem: PatientRowDetails) => {
                    return (
                      <PatientListMobileView
                        key={listItem.patient_id}
                        patientObject={listItem}
                        isArchived={isArchived}
                      />
                    )
                  })}
                <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                  <p className='text-textColor text-sm font-medium'>
                    {Math.min((pageNumber - 1) * 10 + 1, total_patients)}-
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
                    subTitle='Add your first patient and start tracking their data.'
                    subTitleStyle='md:w-[363px] text-base font-normal md:mt-4'
                    buttonText={patientManagementAccess ? null : '+ Add a patient'}
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

export default TableContainerForPracticePatient
