import When from 'components/when/When'
import {useCallback, useContext, useMemo, useState} from 'react'
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
import {PatientRowDetails} from '../types/patientsList.types'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import moment from 'moment'
import PatientListMobileView from './PatientListMobileView'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
import PatientGroupIcon from 'assets/icons/PatientGroupIcon'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {getFirstLetterCapitalOfWord, getImageUrl, getImageUrlById} from 'utils/ConstFunctions'
import {useMediaQuery} from 'react-responsive'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import type {Updater} from '@tanstack/react-table'
import PATIENT_TYPE from '@constants/patientType.constants'
import GetAppInviteStatusRevamp from './GetAppInviteStatusRevamp'
import GetPatientTreatmentStageRevamp from './GetPatientTreatmentStageRevamp'
import {setIsModalConnectWithPatientOpen} from 'redux/Slices/AppSlice/InvitePatient/AddAndSendInvite'
import useDispatchAction from '@hooks/useDispatchAction'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'

const TableContainerForStarterPlanUserPatientList = ({
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
  const pagination = dataPatientsList?.pagination_details
  const patientList = dataPatientsList?.patients
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()
  const total_patients = pagination?.total_patients
  const {userId} = useContext(AuthContext)

  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting(updater)
  }

  const {dispatchAction} = useDispatchAction()

  const [searchParams] = useSearchParams()
  const isFiltered = searchParams.get('isFiltered') === 'true'
  const isCustomerList = searchParams.get('isCustomerList') === 'true'
  const {isStarterPlanUser} = useAllUserPlan()

  const openConnectModalForRow = useCallback(
    (patient?: PatientRowDetails) => {
      if (!patient?.patient_id) {
        dispatchAction(setIsModalConnectWithPatientOpen(true))
        return
      }

      dispatchAction(
        getLeadsProfileDetails({
          patient_id: safeParseInt(patient.patient_id),
          doctor_id: safeParseInt(userId),
        }) as any
      ).finally(() => {
        dispatchAction(setIsModalConnectWithPatientOpen(true))
      })
    },
    [dispatchAction, userId]
  )

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
          const profile_url =
            row?.original?.profile_image_id || row?.original?.profile_picture_id
              ? getImageUrlById(
                  row?.original?.profile_image_id || row?.original?.profile_picture_id
                )
              : getImageUrl(row?.original?.profile_url)
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
                  <div className='flex flex-row items-center text-sm font-normal text-textColor'>
                    <When isTrue={hasValue(row.original.gender)}>
                      <span className='uppercase'>{row.original.gender}</span>
                    </When>

                    <When isTrue={hasValue(row.original.age)}>
                      <span className='ml-1'>,{row.original.age}y</span>
                    </When>
                  </div>
                </div>
              </div>
            </RenderCell>
          )
        },
        size: 250,
      },
      {
        id: 'id',
        accessorKey: 'id',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>ID</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              {hasValue(row.original.custom_patient_id) ? (
                <div>
                  <div className='text-sm text-textColor font-medium'>
                    {row.original?.custom_patient_id?.toUpperCase()}
                  </div>
                </div>
              ) : (
                '-'
              )}
            </RenderCell>
          )
        },
        size: 100,
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
        id: 'practice_location_name',
        accessorKey: 'practice_location_name',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Clinic</p>
                </div>
              ),
            }}
          />
        ),
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
                  {isArchived ? 'Archived on' : 'Created on'}
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
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'treatment_type',
        accessorKey: 'treatment_type',
        enableSorting: true,
        header: ({}) => (
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
        cell: ({row}: {row: Row<PatientRowDetails>}) => {
          return (
            <RenderCell>
              <div className='flex flex-col text-sm'>
                <div className=' flex text-textColor justify-start items-center min-w-[98px] gap-2'>
                  {hasValue(row?.original?.treatments) ? (
                    row?.original?.treatments
                      .filter((product_type: string) => product_type !== 'UNASSIGNED')
                      .map((product_type: string) => (
                        <div key={product_type}>
                          <div className='p-[4px] text-textColor flex justify-center items-center font-semibold text-sm rounded-md'>
                            {getFirstLetterCapitalOfWord(product_type)}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className='text-sm font-semibold text-gray-500'>Pending</div>
                  )}

                  {row?.original?.treatments &&
                    row?.original?.treatments.length === 1 &&
                    row?.original?.treatments[0] === 'UNASSIGNED' && (
                      <div className='text-sm font-semibold self-center text-gray-500'>Pending</div>
                    )}
                </div>

                {/* ✅ Hide this when treatment includes BRACES */}
                {!(row?.original?.treatments || []).includes(treatmentTypeMain.BRACES) && (
                  <div>{GetPatientTreatmentStageRevamp(row.original, isArchived, true)}</div>
                )}
              </div>
            </RenderCell>
          )
        },
        size: 140,
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
          const isBraces = (row?.original?.treatments || []).includes(treatmentTypeMain.BRACES)

          const isTreatmentSetup = row?.original?.aligner_journey_id != null

          if (isBraces) {
            return (
              <RenderCell>
                <div className='text-sm text-textColor font-medium'>-</div>
              </RenderCell>
            )
          }

          if (isBraces) {
            return (
              <RenderCell>
                <div className='text-sm text-textColor font-medium'>-</div>
              </RenderCell>
            )
          }
          return (
            <RenderCell>
              <GetAppInviteStatusRevamp
                app_invite_status={row.original?.app_invite_status}
                onCtaClick={() => openConnectModalForRow(row.original)}
                isTreatmentSetup={isTreatmentSetup}
                isStarterPlanUser={isStarterPlanUser}
              />
            </RenderCell>
          )
        },
        size: 100,
      },
    ],
    [patientList, isFiltered, isCustomerList, openConnectModalForRow]
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

      defaultColumn: {
        size: 150,
        minSize: 50,
        enableSorting: true,
      },
    }
  }, [columns, patientList])

  const table = useReactTable(tableOptions)

  return (
    <div className='md:w-full flex flex-col card-wrapper mb-2 md:h-[calc(100vh-6rem)]'>
      <When isTrue={isModalConnectWithPatientOpen}>
        <ModalConnectWithPatient />
      </When>

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
                    const patientId = row.original.patient_id

                    const handleRowClick = () => {
                      navigation(`${profileBasePath}/${patientId}`)
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
                          subTitle='Add your patient and complete the steps to start tracking their data'
                          subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4'
                          buttonText='+ Add a patient'
                          buttonStyle='mt-[13px] border border-primaryColor text-primaryColor font-semibold px-[85px] md:px-[20px] py-[10px] rounded-[8px] text-[16px]'
                          onClick={() => {
                            if (isStarterPlanUser) {
                              navigation('/add-patient-starter')
                            } else {
                              navigation('/add-patient')
                            }
                          }}
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

export default TableContainerForStarterPlanUserPatientList
