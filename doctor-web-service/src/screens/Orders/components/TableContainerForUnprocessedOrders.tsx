import When from 'components/when/When'
import {useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable,
} from '@tanstack/react-table'
import cn from '@utils/cn'
import {useNavigate} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {Pagination, Spin, Tooltip} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {AlignerRange, IRowUnprocessedOrdersDetails} from '../orders.types'
import ProductionIcon from 'assets/icons/ProductionIcon'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import AddDueDateContainer from './AddDueDateContainer'
import dayjs from 'dayjs'
import {ManufacturingStatus} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import manufacturingConstants from '@constants/manufacturing.constants'
import InfoIcon from 'assets/icons/InfoIcon'
import UnprocessedInfoModal from './UnprocessedInfoModal'
import cx from 'clsx'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ACTION_TOOLTIP =
  'If a case is currently in manufacturing, “Start Production” will be disabled until ongoing production is completed.'

const TableContainerForUnprocessedOrders = ({
  pageNumber,
  setCurrentPageNumber,
  handleSearch,
  caseType,
}: {
  pageNumber: number
  setCurrentPageNumber: (page: number) => void
  handleSearch?: ({}) => void
  caseType?: string
}) => {
  const {orderUnprocessedList, loadingUnprocessedOrderList, activeUsers, loadingActiveUsers} =
    useSelector((state: RootState) => state.orders)

  const ordersList = orderUnprocessedList?.order_details
  const pagination = orderUnprocessedList?.pagination_details
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()
  const totalOrders = pagination?.total_patients
  const {
    isAlignerCompanyOrg,
    isPractice,
    isGrowthPlanUser,
    isEnterprisePlanUser,
    isAdmin,
    isProductionUser,
  } = useAllUserPlan()
  const [sorting, setSorting] = useState<SortingState>([])
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoType, setInfoType] = useState('')
  const permissions = isGrowthPlanUser || isEnterprisePlanUser || isAdmin || isProductionUser

  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      return newSorting
    })
  }

  const refreshData = () => {
    if (handleSearch) {
      handleSearch({})
    }
  }

  const getStatus = (status: ManufacturingStatus) => {
    switch (status) {
      case manufacturingConstants?.MANUFACTURING_STARTED:
        return (
          <div className='flex gap-1 items-center'>
            <div className='w-2  h-2 !min-h-2 bg-primaryColor rounded-full'></div>
            <div className='text-textColor font-semibold text-xs'>In Progress</div>
          </div>
        )
      case manufacturingConstants?.COMPLETED:
        return (
          <div className='flex gap-1 items-center'>
            <div className='w-2 h-2 !min-h-2 bg-[#2E7D32] rounded-full'></div>
            <div className='text-textColor font-semibold text-xs'>Completed</div>
          </div>
        )
      case manufacturingConstants?.SHIPPED:
        return (
          <div className='flex gap-1 items-center'>
            <div className='w-2  h-2 !min-h-2 bg-[#E0802C] rounded-full'></div>
            <div className='text-textColor font-semibold text-xs'>In Transit</div>
          </div>
        )

      default:
        break
    }
  }

  const getDueByStatus = (dueDate?: string | null) => {
    if (!dueDate) return null
    const parsedDueDate = dayjs(dueDate)
    if (!parsedDueDate.isValid()) return null

    const makeStatus = (colorClass: string, label: string) => (
      <div className='flex gap-1 items-center'>
        <div className={`w-2 h-2 !min-h-2 rounded-full ${colorClass}`}></div>
        <div className='text-textColor font-semibold text-xs'>{label}</div>
      </div>
    )

    const today = dayjs().startOf('day')
    const dueDay = parsedDueDate.startOf('day')
    const diffDays = dueDay.diff(today, 'day')

    if (diffDays === 0) {
      return makeStatus('bg-[#E0802C]', 'Due by today')
    }

    if (diffDays > 0) {
      const label = `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
      return makeStatus('bg-[#00Acc1]', label)
    }

    const overdueDays = Math.abs(diffDays)
    const label = `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`
    return makeStatus('bg-[#E53935]', label)
  }

  // ===== Action column helpers =====
  // 🔧 FIX: Treat any items in "in_inventory" OR active-like statuses as "in manufacturing"
  const isInManufacturingNow = (row: IRowUnprocessedOrdersDetails) => {
    const hasInventory = (row?.in_inventory?.count ?? 0) > 0
    const status = row?.latest_batch_manufacturing_status
    const activeStatuses = [
      manufacturingConstants.MANUFACTURING_STARTED,
      manufacturingConstants.IN_PROGRESS,
      manufacturingConstants.SHIPPED,
    ]
    return hasInventory || activeStatuses.includes(status as ManufacturingStatus)
  }

  const hasUnprocessed = (row: IRowUnprocessedOrdersDetails) => (row?.pending?.count ?? 0) > 0

  const handleStartProduction = (e: React.MouseEvent, row: IRowUnprocessedOrdersDetails) => {
    e.stopPropagation() // don't trigger row navigation
    navigation(
      `/production-setup-stepper/${row.patient_id}/${row.treatment_plan_id}?prefill=next-batch`
    )
  }

  const columns = useMemo<ColumnDef<IRowUnprocessedOrdersDetails>[]>(
    () => [
      {
        id: 'patient_name',
        accessorKey: 'patient_name',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-5/6 font-medium text-xs',
              header: (
                <div className='flex justify-between  items-center w-full'>
                  <p>Patient</p>
                  <button
                    onClick={() => {
                      setInfoType('PATIENT')
                      setInfoModalOpen(true)
                    }}
                  >
                    <InfoIcon color='#666666' width='16' height='16' />
                  </button>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-base font-medium text-black truncate ...'>
                {row.original.patient_full_name}
                <When isTrue={row.original?.case_type === 'ARCHIVED'}>
                  <div className='flex gap-1  text-xs  items-center text-textColor'>
                    <div className='w-2  h-2 min-h-2 bg-orange rounded-full'></div>
                    <div>Archived case</div>
                  </div>
                </When>
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },

      ...(isAlignerCompanyOrg
        ? [
            {
              id: 'doctor_name',
              accessorKey: 'doctor_name',
              enableSorting: true,
              header: ({}) => (
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-between items-center w-full  '>
                        <p>{'Practice'}</p>
                      </div>
                    ),
                  }}
                />
              ),
              cell: ({row}: {row: Row<IRowUnprocessedOrdersDetails>}) => {
                return (
                  <RenderCell>
                    <div className='text-sm font-medium'>{row.original.customer}</div>
                  </RenderCell>
                )
              },
              size: 150,
            },
          ]
        : []),
      {
        id: 'total_aligners',
        accessorKey: 'total_aligners',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>TOTAL ALIGNERS</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm text-textColor font-medium'>
                {AlignersSet(row.original.total_aligners)}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'pending',
        accessorKey: 'pending',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full uppercase '>
                  <p>Unprocessed</p>
                  <button
                    onClick={() => {
                      setInfoType('UNPROCESSED')
                      setInfoModalOpen(true)
                    }}
                  >
                    <InfoIcon color='#666666' width='16' height='16' />
                  </button>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm text-textColor font-medium'>
                {AlignersSet(row.original.pending)}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },

      {
        id: 'in_inventory',
        accessorKey: 'in_inventory',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full uppercase '>
                  <p>IN manufacturing</p>
                  <button
                    onClick={() => {
                      setInfoType('MANUFACTURING')
                      setInfoModalOpen(true)
                    }}
                  >
                    <InfoIcon color='#666666' width='16' height='16' />
                  </button>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm text-textColor font-medium'>
                {AlignersSet(row.original.in_inventory)}
              </div>{' '}
              <div>{getStatus(row.original?.latest_batch_manufacturing_status)}</div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'delivered',
        accessorKey: 'delivered',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full uppercase '>
                  <p>Delivered till date</p>
                  <button
                    onClick={() => {
                      setInfoType('DELIVERED')
                      setInfoModalOpen(true)
                    }}
                  >
                    <InfoIcon color='#666666' width='16' height='16' />
                  </button>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm text-textColor font-medium'>
                {AlignersSet(row.original.delivered)}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'due_by',
        accessorKey: 'due_by',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Due by</p>
                  <button
                    onClick={() => {
                      setInfoType('DUE_BY')
                      setInfoModalOpen(true)
                    }}
                  >
                    <InfoIcon color='#666666' width='16' height='16' />
                  </button>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<IRowUnprocessedOrdersDetails>}) => {
          return (
            <RenderCell>
              {row?.original?.pending?.count === 0 ? (
                '-'
              ) : (
                <>
                  <div className='text-sm font-medium text-black'>
                    {row?.original?.due_by
                      ? dayjs(row?.original?.due_by).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                  <div>{getDueByStatus(row.original?.due_by)}</div>
                </>
              )}
            </RenderCell>
          )
        },
        size: 100,
      },

      {
        id: 'reminder_date',
        accessorKey: 'reminder_date',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Reminder</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<IRowUnprocessedOrdersDetails>}) => {
          return (
            <RenderCell>
              <When isTrue={row.original?.case_type !== 'ARCHIVED' && permissions}>
                <div className=''>
                  <AddDueDateContainer
                    order_due_by={row?.original?.reminder_date}
                    reminder_id={row.original.reminder_id}
                    refreshData={refreshData}
                    isReminder={true}
                    patient_id={row?.original?.patient_id}
                    treatment_plan_id={row?.original?.treatment_plan_id}
                  />
                </div>
              </When>
            </RenderCell>
          )
        },
        size: 100,
      },

      // ===== ACTION column (always visible) =====
      {
        id: 'action',
        accessorKey: 'action',
        enableSorting: false,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header:
                caseType === 'ARCHIVED' ? (
                  <div className='flex justify-between items-center w-full'>
                    <p>Action</p>
                  </div>
                ) : (
                  <div className='flex justify-between items-center w-full'>
                    <p>Action</p>
                    <Tooltip title={ACTION_TOOLTIP} trigger={['click', 'hover']}>
                      <span
                        onClick={(e) => e.stopPropagation()}
                        role='button'
                        aria-label='Action info'
                      >
                        <InfoIcon color='#666666' width='16' height='16' />
                      </span>
                    </Tooltip>
                  </div>
                ),
            }}
          />
        ),
        cell: ({row}: {row: Row<IRowUnprocessedOrdersDetails>}) => {
          const r = row.original

          if (caseType === 'ARCHIVED') {
            const archivedRaw = (r as any)?.archived_on
            const archivedText = archivedRaw
              ? `Archived on ${dayjs(archivedRaw).format('DD-MMM-YYYY')}`
              : '-'

            return (
              <RenderCell>
                <span className='text-sm text-textColor'>{archivedText}</span>
              </RenderCell>
            )
          }

          // Existing behavior for Active/Refinement — now strictly hide CTA if anything is in manufacturing
          const inMfg = isInManufacturingNow(r)
          const canStart = !inMfg && hasUnprocessed(r)

          return (
            <RenderCell>
              {isPractice ? (
                <span className='text-sm text-textColor'>-</span>
              ) : inMfg ? (
                <div className='flex items-center gap-1 text-xs font-semibold text-textColor'>
                  <span className='w-2 h-2 !min-h-2 bg-primaryColor rounded-full' />
                  <span>In Progress</span>
                  <Tooltip title={ACTION_TOOLTIP} trigger={['click', 'hover']}>
                    <span
                      className='ml-1'
                      onClick={(e) => e.stopPropagation()}
                      role='button'
                      aria-label='Action info'
                    >
                      <InfoIcon color='#666666' width='14' height='14' />
                    </span>
                  </Tooltip>
                </div>
              ) : canStart ? (
                <button
                  type='button'
                  onClick={(e) => handleStartProduction(e, r)}
                  className='px-3 py-1.5 rounded-lg bg-primaryColor text-white text-xs font-semibold hover:opacity-90 transition'
                >
                  Start Production
                </button>
              ) : (
                <span className='text-sm text-textColor'>-</span>
              )}
            </RenderCell>
          )
        },
        size: 140,
      } as ColumnDef<IRowUnprocessedOrdersDetails>,
      // ======================================================
    ],
    [ordersList, activeUsers, caseType]
  )

  const tableOptions = {
    columns: columns,
    data: ordersList,
    state: {sorting},
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        due_by: isEnterprisePlanUser || isGrowthPlanUser,
        reminder_date: isEnterprisePlanUser || isGrowthPlanUser,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 150,
      minSize: 50,
      enableSorting: true,
    },
  }

  const table = useReactTable(tableOptions)

  const TableHeader = (props: Table<IRowUnprocessedOrdersDetails>) => {
    return (
      <thead>
        {props.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className='bg-lightGray sticky top-0'>
            {headerGroup.headers.map((header, index: number) => (
              <th
                key={index}
                colSpan={header.colSpan}
                className='text-xs font-medium uppercase px-2 py-3'
              >
                <div
                  {...{
                    className: cn(
                      'text-xs flex justify-center items-center gap-4',
                      header.column.getCanSort() && 'cursor-pointer select-none',
                      header.column.getIsLastColumn() ? '' : 'border-r-2 border-mediumGray'
                    ),
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {
                    {
                      asc: <ArrowUpDownIcon color1='#666666' color2='#66666680' />,
                      desc: <ArrowUpDownIcon color2='#666666' color1='#66666680' />,
                    }[header.column.getIsSorted() as string]
                  }
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
    )
  }

  const TableBody = (props: Table<IRowUnprocessedOrdersDetails>) => {
    return (
      <>
        {props.getRowModel().rows?.length === 0 ? (
          <tbody>
            <tr>
              <td
                colSpan={table.getHeaderGroups()[0]?.headers?.length}
                className='text-center py-4'
              >
                <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
                  <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
                    <ProductionIcon color='#666666' width='32' height='32' />
                  </div>
                  {caseType === 'ARCHIVED' ? (
                    <>
                      <p className='text-base font-medium'>No archived cases found.</p>
                    </>
                  ) : (
                    <>
                      <p className='italic text-base'>
                        No unprocessed aligners available for production.
                      </p>
                      <p className='text-sm text-gray-500'>
                        All batches are currently in manufacturing or completed.
                      </p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const className = cn(`text-black text-base group cursor-pointer`)
              return (
                <tr
                  key={row.id}
                  className={className}
                  onClick={() => {
                    navigation(`${profileBasePath}/${row.original.patient_id}`)
                    return
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cx('px-3 py-4')}>
                      <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        )}
      </>
    )
  }

  return (
    <div className='border border-mediumGray rounded-lg max-h-[calc(100vh-100px)] w-full overflow-scroll'>
      <UnprocessedInfoModal
        openModal={infoModalOpen}
        setOpenModal={setInfoModalOpen}
        status={infoType}
      />
      <Spin
        indicator={<Spinner loading />}
        spinning={loadingUnprocessedOrderList || loadingActiveUsers}
      >
        <table className='w-full'>
          <TableHeader {...table} />
          <TableBody {...table} />
        </table>
        {/* Sticky Pagination */}
        <div className='border-t border-mediumGray bg-white sticky bottom-0 left-0 w-full z-10'>
          <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
            <p className='text-textColor text-sm font-medium'>
              {Math.min((pageNumber - 1) * 10 + 1, totalOrders)}-
              {Math.min(pageNumber * 10, totalOrders)} from {totalOrders}
            </p>
            <Pagination
              showSizeChanger={false}
              current={pageNumber}
              defaultPageSize={10}
              onChange={(page) => {
                setCurrentPageNumber(page)
              }}
              total={totalOrders}
            />
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForUnprocessedOrders

const AlignersSet = (aligners: AlignerRange) => {
  const upper =
    aligners?.upper_range_start && aligners?.upper_range_start !== 0
      ? `U${aligners?.upper_range_start} to U${aligners?.upper_range_end} `
      : ''

  const dot =
    aligners?.upper_range_start &&
    aligners?.upper_range_start !== 0 &&
    aligners?.lower_range_start &&
    aligners?.lower_range_start !== 0
      ? ' • '
      : ''

  const lower =
    aligners?.lower_range_start && aligners?.lower_range_start !== 0
      ? `L${aligners?.lower_range_start} to L${aligners?.lower_range_end}`
      : ''

  return (
    <>
      {aligners?.count ? (
        <div>
          <div className='text-black text-sm font-medium'> {aligners?.count}</div>
          {(upper || lower) && (
            <div className='text-textColor text-sm font-normal'>{`${upper}${dot}${lower}`}</div>
          )}
        </div>
      ) : (
        '-'
      )}
    </>
  )
}
