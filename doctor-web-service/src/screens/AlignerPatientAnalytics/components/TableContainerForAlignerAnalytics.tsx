import When from 'components/when/When'
import {useContext, useEffect, useMemo, useState} from 'react'
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
import {useNavigate} from 'react-router-dom'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {Divider, Pagination, Popover, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import useActiveProfile from '@hooks/useActiveProfile'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Formik} from 'formik'
import useDispatchAction from '@hooks/useDispatchAction'
import {getFirstLetterCapitalOfWord, getImageUrl, getImageUrlById} from 'utils/ConstFunctions'
import CustomDrawer from 'components/drawer/CustomDrawer'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useMediaQuery} from 'react-responsive'
import {RowData} from '../types/alignerPatientAnalytics.types'
import GetCompilance from './GetCompilance'
import ThreeDotMenuIcon from 'assets/icons/ThreeDotMenuIcon'
import BellSimpleIcon from 'assets/icons/BellSimpleIcon'
import {
  setOpenRemindDrawer,
  setRemindAll,
} from 'redux/Slices/AppSlice/AlignerPatientAnalytics/AlignerPatientAnalytics.slice'
import {AuthContext} from 'context/AuthContext'
import AlignerAnalyticsMobileView from './AlignerAnalyticsMobileView'
import ChartDonut from 'assets/icons/ChartDonut'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {schemaRemindPatient} from '../types/schemaRemindPatient'
import userTypes from '@constants/userTypes'
import {postApiDataPatientNudge} from 'redux/Slices/AppSlice/Dashboard/PatientNudgeSlice'
import FormikMultiSelectList from 'components/atom/Dropdown/FormikMultiSelectList'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import {optionType} from 'types/optionType'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import InfoIcon from 'assets/icons/InfoIcon'
import InfoModal from './InfoModal'
import useAllUserPlan from '@hooks/useAllUserPlan'

const TableContainerForAlignerAnalytics = ({
  search,
  pageNumber,
  handleOnSearch,
}: {
  search: string | null
  pageNumber: number
  handleOnSearch: ({page, search}: {page: number; search: string | null}) => void
}) => {
  const {userId} = useContext(AuthContext)
  const {
    dataList,
    dataAllList,
    loadingAllList,
    loadingList,
    openRemindDrawer,
    isRemindAll,
    selectedFilter,
  } = useSelector((state: RootState) => state.AlignerPatientAnalytics)
  const pagination = dataList.pagination_details
  const patientList = dataList.patient_analytics_details
  const [patient, setPatient] = useState<{
    patient_id: number
    patient_name: string
    patient_compliance: 'NEED_ATTENTION' | 'AT_RISK' | 'ON_TRACK'
  } | null>(null)
  const navigation = useNavigate()
  const total_patients = pagination?.total_patients
  const {activeProfile} = useActiveProfile()
  const doctorFullName = `${activeProfile.first_name}. ${activeProfile.first_name} ${activeProfile.last_name}`
  const {isOrganization} = useAllUserPlan()
  const {permissionChecks} = useFeatureAccess()
  const practicePermissions =
    permissionChecks?.customerManagement?.customerManagement?.isEditable ?? false
  const showPractice = hasValue(practicePermissions) ? practicePermissions : true
  const showContactsAndClinic = !practicePermissions
  const [sorting, setSorting] = useState<SortingState>([])
  const {dispatchAction} = useDispatchAction()
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {loading} = useSelector((state: RootState) => state.apiPatientNudgeSlice)
  const [showModal, setShowModal] = useState(false)
  const practiceLocationPermissions =
    permissionChecks?.practiceLocation?.managePracticeLocations?.isViewable
  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      return newSorting
    })
  }

  const columns = useMemo<ColumnDef<RowData>[]>(
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
        cell: ({row}) => {
          const profile_url = row?.original?.patient_profile_image_id
            ? getImageUrlById(row?.original?.patient_profile_image_id)
            : row?.original?.patient_profile_url
          return (
            <RenderCell>
              <div className='flex gap-2 items-center'>
                {hasValue(profile_url) ? (
                  <Image
                    className='w-11 h-11 object-cover rounded-full'
                    src={
                      row?.original?.patient_profile_image_id
                        ? profile_url
                        : getImageUrl({
                            url: profile_url,
                            is_gdrive_platform:
                              row?.original?.patient_profile_url.includes('patient/drive/image/'),
                            drive_file_id: row?.original?.patient_profile_url.match(
                              /patient\/drive\/image\/([^/?#]+)/
                            )?.[1],
                          }) || row?.original?.patient_profile_url
                    }
                    showLoading={true}
                  />
                ) : (
                  <DefaultImage letter={row.original.patient_full_name?.charAt(0)} />
                )}
                <div>
                  <div className='text-sm font-medium text-black'>
                    {row.original.patient_full_name}
                  </div>
                  <When isTrue={row.original.your_patient}>
                    <div className='text-sm font-normal text-textColor uppercase'>
                      {row.original.customer_mapped_id}
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
        cell: ({row}) => {
          return (
            <RenderCell>
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
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'assigned_practice',
        accessorKey: 'assigned_practice',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Practice</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm text-textColor font-medium'>
                {row.original?.assigned_practice ?? '-'}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },

      ...(practiceLocationPermissions
        ? [
            {
              id: 'practice_location',
              accessorKey: 'practice_location',
              enableSorting: true,
              header: ({}) => (
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-between items-center w-full  '>
                        <p>Practice location</p>
                      </div>
                    ),
                  }}
                />
              ),
              cell: ({row}: {row: Row<RowData>}) => {
                return (
                  <RenderCell>
                    <div className='text-sm text-textColor font-medium'>
                      {row?.original?.practice_location ?? '-'}
                    </div>
                  </RenderCell>
                )
              },
              size: 150,
            },
          ]
        : []),
      {
        id: 'aligner_updates',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-start gap-2'>
                  <div className='flex justify-between items-center w-full'>Aligner Updates</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowModal(true)
                    }}
                  >
                    <InfoIcon width='18' height='18' color={'#666'} />
                  </button>
                </div>
              ),
            }}
          />
        ),
        accessorKey: 'aligner_updates',
        enableSorting: true,
        cell: ({row}) => {
          return (
            <div className='flex gap-2 justify-start items-center h-11 truncate ...'>
              {row.original.aligner_updates === 0 ? (
                <div className='flex gap-2 items-center'>
                  <div className='w-2 h-2 bg-tertiaryColor rounded-full'></div>
                  <div className='text-tertiaryColor font-semibold text-sm'>Completed</div>
                </div>
              ) : (
                <div className='flex gap-2 items-center justify-center'>
                  <div className='w-2 h-2 bg-orange rounded-full'></div>
                  <div className='text-orange font-semibold text-sm'>
                    {row.original.aligner_updates + ' Pending'}
                  </div>
                </div>
              )}
            </div>
          )
        },
        size: 150,
      },
      {
        id: 'current_aligner',
        accessorKey: 'current_aligner',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Current Aligner</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div>
                <div className='text-sm font-medium text-black'>
                  {getFirstLetterCapitalOfWord(row?.original?.current_aligner_jaw_type) +
                    ' ' +
                    row?.original?.current_aligner}
                </div>
                <div className='text-xs text-textColor font-semibold'>
                  {'Total ' + row?.original?.total_aligners}
                </div>
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'compilance',
        accessorKey: 'compilance',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>{'Compliance'}</div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              {row.original.compliance ? (
                <GetCompilance app_invite_status={row.original.compliance} />
              ) : (
                '-'
              )}
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'aligner_journey_id',
        accessorKey: 'aligner_journey_id',
        enableSorting: true,
        header: '',
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex items-center gap-2 bg-transparent'>
                <When
                  isTrue={
                    showContactsAndClinic &&
                    row.original.compliance !== 'ON_TRACK' &&
                    row.original.patient_app_invite_status === 'CONNECTED'
                  }
                >
                  <Popover
                    content={
                      <div className='relative p-3 min-w-[200px] '>
                        <button
                          className='flex gap-2 items-center text-base font-medium'
                          onClick={(e) => {
                            e.stopPropagation()
                            setPatient({
                              patient_id: row.original.patient_id,
                              patient_name: row.original.patient_full_name,
                              patient_compliance: row.original.compliance,
                            })
                            dispatchAction(setRemindAll(false))
                            dispatchAction(setOpenRemindDrawer(true))
                          }}
                        >
                          <BellSimpleIcon className='' color='#666' />
                          <div>Remind</div>
                        </button>
                      </div>
                    }
                    trigger='click'
                    overlayInnerStyle={{padding: 0, fontFamily: 'figtree'}}
                    placement={'left'}
                  >
                    <button className='w-2 no-row-click'>
                      <ThreeDotMenuIcon color={'#666666'} height='18' width='18' />
                    </button>
                  </Popover>
                </When>
                <button className='w-3 p-3'>
                  <CaretRightIcon color={'#666666'} />
                </button>
              </div>
            </RenderCell>
          )
        },
        size: 100,
      },
    ],
    [patientList, showContactsAndClinic, showPractice]
  )

  const tableOptions = useMemo(() => {
    return {
      columns: columns,
      data: Array.isArray(patientList) ? patientList : [],
      state: {sorting},
      onSortingChange: handleSortingChange,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getCoreRowModel: getCoreRowModel(),
      initialState: {
        columnVisibility: {
          assigned_practice: showPractice,
          practice_location: showContactsAndClinic,
          email: showContactsAndClinic,
        },
      },
      defaultColumn: {
        size: 150,
        minSize: 50,
        enableSorting: true,
      },
    }
  }, [showContactsAndClinic, columns, patientList, sorting, isOrganization, showPractice])

  const table = useReactTable(tableOptions)

  return (
    <div className='md:w-full flex flex-col card-wrapper mb-2 md:h-[calc(100vh-6rem)]'>
      <InfoModal showModal={showModal} setShowModal={setShowModal} showInfoAlinerUpdate={true} />

      <Formik
        initialValues={{
          patients: [] as number[],
          message:
            selectedFilter === 'NEEDS_ATTENTION' || patient?.patient_compliance === 'NEED_ATTENTION'
              ? 'Hi! We’ve noticed that your aligner change is significantly overdue. Delaying too long can affect your treatment progress. Please switch to your next aligner immediately, and let us know if you need any help!'
              : 'Hi! A quick reminder that your aligner change is overdue. Staying on schedule is key to achieving the best results. Please make the switch soon, and reach out if you have any questions!',
        }}
        validationSchema={schemaRemindPatient}
        enableReinitialize
        validateOnMount
        onSubmit={async (values) => {
          const selectedPatients = values.patients
            .map((id) => {
              const match = dataAllList.find((item) => item.value === id)
              return match ? {patient_id: match.value, patient_name: match.label} : null
            })
            .filter(Boolean)

          const postData = {
            data: {
              patients: isRemindAll ? selectedPatients : [patient],
              doctor_name: doctorFullName,
              doctor_id: userId,
              message: values.message,
              role_name: getFirstLetterCapitalOfWord(userTypes.DOCTOR),
              created_by: doctorFullName,
            },
          }

          dispatchAction(postApiDataPatientNudge(postData) as any)
            .unwrap()
            .then(() => {
              setPatient(null)
              dispatchAction(setOpenRemindDrawer(false))
              SuccessToast('Broadcast message sent!')
            })
            .catch(() => {})
        }}
      >
        {(formik) => {
          useEffect(() => {
            if (isRemindAll && dataAllList?.length > 0) {
              const list = dataAllList.map((item: optionType) => item.value)
              formik.setFieldValue('patients', list)
            } else {
              formik.setFieldValue('patients', [patient?.patient_id])
            }
          }, [isRemindAll, dataAllList, patient])

          return (
            <CustomDrawer
              title='Add message'
              subTitle='Choose from quick select or write your custom message'
              width={!isMobile ? '700' : '100%'}
              open={openRemindDrawer}
              placement={isMobile ? 'bottom' : undefined}
              height='90%'
              destroyOnClose={true}
              onClose={() => {
                dispatchAction(setOpenRemindDrawer(false))
                formik.resetForm()
              }}
              footer={
                <div className='flex gap-3 w-full md:w-auto justify-end'>
                  <AntdButton
                    className='hover:!bg-white !bg-white hover:!text-textColor h-10 font-semibold text-base w-fit border !border-mediumGray !text-textColor'
                    isLoading={loading}
                    text='Go back'
                    onClick={() => {
                      dispatchAction(setOpenRemindDrawer(false))
                      formik.resetForm()
                    }}
                  />
                  <AntdButton
                    className='bg-primaryColor text-white h-10 font-semibold text-base w-fit'
                    isLoading={formik.isSubmitting || loading}
                    disabled={!formik.isValid}
                    text='Confirm and send'
                    htmlType='submit'
                    onClick={() => formik.handleSubmit()}
                  />
                </div>
              }
            >
              <When isTrue={isRemindAll}>
                <FormikMultiSelectList
                  name='patients'
                  label='Select patients'
                  items={dataAllList}
                  loading={loadingAllList}
                  notFoundContent='No patients found'
                  onChangeSuccess={(selectedPatients) =>
                    formik.setFieldValue('patients', selectedPatients)
                  }
                />

                <Divider />
              </When>

              <div className='flex justify-between text-textColor font-medium text-sm'>
                <div>Custom message (click to edit)</div>
                <div>{formik.values.message?.length ?? 0}/500 characters</div>
              </div>

              <FormikInputTextArea name={'message'} required maxLength={500} />
            </CustomDrawer>
          )
        }}
      </Formik>
      <Spin indicator={<Spinner loading />} spinning={loadingList}>
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
              {table.getRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={table.getHeaderGroups()[0]?.headers.length}
                      className='text-center py-4'
                    >
                      <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
                        <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
                          <ChartDonut />
                        </div>
                        <p>{hasValue(search) ? 'No patients present' : 'No updates yet'}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className='border-b border-lightgray text-black text-base group cursor-pointer'
                      onClick={(e) => {
                        if ((e.target as Element).closest('.no-row-click')) {
                          return
                        }

                        navigation(`/profile/${row.original.patient_id}`)
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='px-2 py-3'>
                          <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
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
                  .map((listItem: RowData) => {
                    return (
                      <AlignerAnalyticsMobileView
                        key={listItem.patient_id}
                        patientObject={listItem}
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
                <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
                  <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
                    <ChartDonut />
                  </div>
                  <p>{hasValue(search) ? 'No patients present' : 'No updates yet'}</p>
                </div>
              </div>
            )}
          </When>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForAlignerAnalytics
