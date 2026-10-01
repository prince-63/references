import React, {useCallback, useContext, useEffect, useMemo} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table'
import {PayloadStatusChange, Task} from '../types/alignerProduction.types'
import {Select, Spin, Pagination} from 'antd'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import Spinner from 'components/spinner/Spinner'
import moment from 'moment'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  changeMultiStatus,
  updateInfoDataList,
} from 'redux/Slices/AppSlice/AlignerProduction/AlignerProduction.slice'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {formatManufacturingLabel} from '@utils/kanban'
import {AssigneeUserSelector} from 'screens/Kanban/components/AssigneeUserSelector'
import AddDueDate from './AddDueDate'
import InfoIcon from 'assets/icons/InfoIcon'
import getColorPalette from 'utils/getColorPalette'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {SortKey} from '../AlignerProduction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {getAccessControlUserList} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'

type Option = {label: string; value: number}

type Flag = {
  id: number
  profile_id?: number
  content: string
  location?: string
  show?: boolean
}

type Props = {
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
  onSelectionChange?: (taskInfo: {task_id: number; patient_id: number}[]) => void
  selectedFilter?: string | null
  sortBy: SortKey
  onSortChange: (key: SortKey) => void
  clearSelectionTick: number
  statusOptions: Option[]
  statusLoading: boolean
}

// ---------- helpers ----------
const parseServiceProducts = (sp: string) => {
  if (!sp) return null
  if (typeof sp === 'string') {
    try {
      return JSON.parse(sp)
    } catch {
      return null
    }
  }
  return sp
}

// Small utility to attach mobile column widths without touching desktop.
type ColMeta = {mobileClass?: string}
const col = <T,>(
  def: ColumnDef<T> & {meta?: ColMeta},
  mobileClass?: string
): ColumnDef<T> & {meta?: ColMeta} => ({
  ...def,
  meta: {...(def.meta || {}), mobileClass},
})

const TableContainerForAlignerProduction: React.FC<Props> = ({
  pageNumber,
  handleOnSearch,
  onSelectionChange,
  selectedFilter,
  sortBy,
  onSortChange,
  clearSelectionTick,
  statusOptions,
  statusLoading,
}) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {allAlignerData, loadingAllAlignerData, workflowId} = useSelector(
    (state: RootState) => state.alignerProduction
  )

  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})

  const totalAligners = allAlignerData?.pagination_details?.total_patients ?? 0
  const pageSize = 100
  const totalPages = allAlignerData?.pagination_details?.total_pages ?? 0

  const isCompletedMode = (selectedFilter ?? '').toUpperCase() === 'COMPLETED'
  const {permissionChecks} = useFeatureAccess()
  const ongoingProductionAccess = permissionChecks?.ongoingProduction

  const loadAssignees = useCallback(() => {
    const parsedDoctorId = safeParseInt(userId)
    if (!parsedDoctorId) return
    dispatchAction(
      getAccessControlUserList({
        doctor_id: parsedDoctorId,
        search: null,
        status: 'ACCEPTED',
        sub_role_id: null,
        page_number: 0,
        page_size: 0,
      }) as any
    )
  }, [dispatchAction, userId])

  useEffect(() => {
    if (!ongoingProductionAccess?.assignee?.isViewable) return
    loadAssignees()
  }, [loadAssignees, ongoingProductionAccess?.assignee?.isViewable])

  useEffect(() => {
    loadAssignees()
  }, [loadAssignees])

  const refreshData = () => handleOnSearch({page: pageNumber})

  const tableData: Task[] = useMemo(() => {
    const raw: Task[] = (allAlignerData?.tasks ?? []).map((t: Task) => ({
      ...t,
      service_products: parseServiceProducts(t?.service_products),
    }))

    if (isCompletedMode) {
      return [...raw]
        .filter((t) => (t.current_status_name ?? '').toUpperCase() === 'COMPLETED')
        .sort((a: any, b: any) => {
          const aTime = new Date(a.created_on ?? a.updated_on ?? 0).getTime()
          const bTime = new Date(b.created_on ?? b.updated_on ?? 0).getTime()
          return bTime - aTime
        })
    }
    return raw.filter((t) => (t.current_status_name ?? '').toUpperCase() !== 'COMPLETED')
  }, [allAlignerData?.tasks, isCompletedMode])

  const SortableHeader = ({label, keyName}: {label: string; keyName: SortKey}) => (
    <div
      className={`flex justify-between items-center w-full cursor-pointer select-none ${
        sortBy === keyName ? 'underline underline-offset-4' : ''
      }`}
      onClick={() => onSortChange(keyName)}
      title={`Sort by ${label}`}
    >
      <p>{label}</p>
    </div>
  )

  // -------- columns (desktop unchanged; mobile gets min widths) --------
  const baseColumns: (ColumnDef<Task> & {meta?: ColMeta})[] = [
    col<Task>(
      {
        id: 'select',
        header: ({table}) => (
          <input
            type='checkbox'
            className='h-4 w-4 cursor-pointer'
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({row}) => (
          <input
            type='checkbox'
            className='h-4 w-4 cursor-pointer'
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 48,
      },
      // keep tiny on mobile too
      'min-w-[48px]'
    ),

    col<Task>(
      {
        id: 'patient_name',
        accessorKey: 'patient_name',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<SortableHeader label='PATIENT' keyName='PATIENT_NAME' />}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='font-semibold text-textColor'>{row.original.patient_name}</div>
          </RenderCell>
        ),
        size: 200,
      },
      'min-w-[220px] md:min-w-0'
    ),

    col<Task>(
      {
        id: 'batch_number',
        accessorKey: 'batch_number',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>BATCH</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='font-semibold text-textColor'>
              {formatManufacturingLabel(row.original)}
            </div>
          </RenderCell>
        ),
      },
      'min-w-[190px] md:min-w-0'
    ),

    // Product — give a little extra space on mobile
    col<Task>(
      {
        id: 'product',
        accessorKey: 'product',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>PRODUCT</div>} />
        ),
        cell: ({row}) => {
          const name = row.original?.product_name
          return (
            <RenderCell>
              <div className='font-semibold text-textColor'>{name || '-'}</div>
            </RenderCell>
          )
        },
      },
      'min-w-[240px] md:min-w-0'
    ),

    ...(ongoingProductionAccess?.status?.isViewable
      ? [
          col<Task>(
            {
              id: 'current_status_name',
              accessorKey: 'current_status_name',
              header: () => (
                <RenderTableHeader
                  className='w-full font-medium text-xs'
                  header={<div>STATUS</div>}
                />
              ),
              cell: ({row}: {row: Row<Task>}) => (
                <RenderCell>
                  {isCompletedMode ? (
                    <div className='text-sm text-medium text-gray-700'>COMPLETED</div>
                  ) : ongoingProductionAccess?.status?.isViewable ? (
                    <div className='text-sm font-medium text-black'>
                      <Select
                        className='w-40 h-10'
                        placeholder='Select Status'
                        labelInValue
                        loading={statusLoading}
                        value={
                          row.original?.current_workflow_status_id != null
                            ? {
                                value: Number(row.original.current_workflow_status_id),
                                label: row.original?.current_workflow_status_label_name ?? '',
                              }
                            : undefined
                        }
                        options={statusOptions}
                        optionLabelProp='label'
                        optionFilterProp='label'
                        showSearch
                        getPopupContainer={(node) => node.parentElement!}
                        onChange={(v: {value: number; label: React.ReactNode}) => {
                          if (!workflowId) return
                          const payload: PayloadStatusChange = {
                            task_info: [
                              {
                                patient_id: safeParseInt(row.original?.patient_id),
                                task_id: row.original.id,
                              },
                            ],
                            doctor_id: safeParseInt(userId),
                            workflow_status_id: v.value,
                            workflow_id: Number(workflowId),
                          }
                          dispatchAction(changeMultiStatus(payload))
                            .unwrap()
                            .then(() => {
                              SuccessToast('Production status updated successfully!')
                              handleOnSearch({page: pageNumber})
                            })
                        }}
                      />
                    </div>
                  ) : (
                    '-'
                  )}
                </RenderCell>
              ),
            },
            'min-w-[180px] md:min-w-0'
          ),
        ]
      : []),

    col<Task>(
      {
        id: 'assignee',
        accessorKey: 'assignee',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>ASSIGNEE</div>} />
        ),
        cell: ({row}) => {
          const assigneeProfileId =
            safeParseInt((row.original as any)?.assignee_profile_id) ||
            safeParseInt((row.original as any)?.assignee_id)

          return (
            <RenderCell>
              {ongoingProductionAccess?.assignee?.isViewable ? (
                <AssigneeUserSelector
                  bordered={false}
                  taskId={row.original?.id}
                  assigneeName={row.original?.assignee}
                  assigneeProfileId={assigneeProfileId}
                  workflowName={row.original?.workflow_name}
                  workflowId={row.original?.workflow_id}
                  parentTaskId={row.original?.parent_task_id}
                  patientId={row.original?.patient_id}
                  ongoingLabelCounts={(row.original as any)?.ongoing_label_counts}
                  onAssigned={refreshData}
                  multiTask={false}
                  className='!min-w-[140px] !p-0 !m-0 !text-sm !font-medium [&_.ant-select-selector]:!border-none [&_.ant-select-selector]:!border [&_.ant-select-selector]:!border-mediumGray hover:[&_.ant-select-selector]:!border-primaryColor [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:hover:!bg-transparent [&_.ant-select-selection-item]:!text-black  [&_.ant-select-selector:hover_.ant-select-selection-item]:!text-primaryColor [&_.ant-select-selection-placeholder]:!text-gray-500'
                />
              ) : (
                '-'
              )}
            </RenderCell>
          )
        },
      },
      'min-w-[200px] md:min-w-0'
    ),

    // Updated On — give a bit more width on mobile
    col<Task>(
      {
        id: 'created_on',
        accessorKey: 'created_on',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<SortableHeader label='UPDATED ON' keyName='UPDATED_ON' />}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium'>
              {row.original.created_on
                ? moment(row.original.created_on).format('DD-MMM-YYYY, hh:mm A')
                : '-'}
            </div>
          </RenderCell>
        ),
      },
      'min-w-[240px] md:min-w-0'
    ),

    ...(ongoingProductionAccess?.dueDate?.isViewable
      ? [
          // Due Date — a little more width on mobile
          col<Task>(
            {
              id: 'estimated_completion_date',
              accessorKey: 'estimated_completion_date',
              header: () => (
                <RenderTableHeader
                  className='w-full font-medium text-xs'
                  header={<SortableHeader label='DUE DATE' keyName='NEXT_FOLLOW_UP' />}
                />
              ),
              cell: ({row}: {row: Row<Task>}) => (
                <RenderCell>
                  {ongoingProductionAccess?.dueDate?.isViewable ? (
                    <div className='text-sm font-medium'>
                      <AddDueDate
                        refreshData={refreshData}
                        id={row.original.id}
                        date={row.original.estimated_completion_date}
                      />
                    </div>
                  ) : (
                    '-'
                  )}
                </RenderCell>
              ),
            },
            'min-w-[240px] md:min-w-0'
          ),
        ]
      : []),
  ]

  const columns: ColumnDef<Task>[] = useMemo(() => {
    if (!isCompletedMode) return baseColumns
    const hiddenIds = new Set(['select', 'assignee', 'estimated_completion_date'])
    return baseColumns.filter((c) => !hiddenIds.has(c.id as string))
  }, [isCompletedMode, statusOptions]) // eslint-disable-line

  const table = useReactTable({
    data: tableData,
    columns,
    state: {rowSelection},
    enableRowSelection: !isCompletedMode,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    getRowId: (row: Task) => String(row.id),
  })

  useEffect(() => {
    table.resetRowSelection()
    table.toggleAllPageRowsSelected(false)
    onSelectionChange?.([])
  }, [clearSelectionTick]) // eslint-disable-line

  useEffect(() => {
    if (!onSelectionChange || isCompletedMode) return
    const selectedTaskInfo: {task_id: number; patient_id: number}[] = []
    table.getRowModel().rows.forEach((row) => {
      if (rowSelection[row.id]) {
        selectedTaskInfo.push({task_id: row.original.id, patient_id: row.original.patient_id})
      }
    })
    onSelectionChange(selectedTaskInfo)
  }, [rowSelection, table, onSelectionChange, isCompletedMode])

  const start = Math.min((pageNumber - 1) * pageSize + 1, Math.max(totalAligners, 0))
  const end = Math.min(pageNumber * pageSize, totalAligners)

  const isPageLoading = loadingAllAlignerData || statusLoading

  const visibleFlags: Flag[] = useMemo(() => {
    const all: Flag[] = Array.isArray(allAlignerData?.flags) ? allAlignerData.flags : []
    return all.filter(
      (f) => (f?.location ?? '').toUpperCase() === 'ONGOING_PRODUCTION_LIST' && Boolean(f?.show)
    )
  }, [allAlignerData?.flags])

  const {profileId: ctxProfileId} = useContext(AuthContext)
  const handleDismissFlag = (id: number) => {
    dispatchAction(
      updateInfoDataList({
        flag_id: id,
        profile_id: safeParseInt(ctxProfileId),
      })
    )
      .unwrap()
      .then(() => {
        handleOnSearch({page: pageNumber})
      })
  }

  return (
    <Spin indicator={<Spinner loading />} spinning={isPageLoading} tip='Loading...'>
      <div className='w-full h-full'>
        {visibleFlags.length > 0 && (
          <div className='flex flex-col gap-3 mb-3'>
            {visibleFlags.map((flag) => (
              <div
                key={flag.id}
                className='relative bg-primarySupport border border-primaryColor rounded-md p-4'
              >
                <button
                  type='button'
                  aria-label='Dismiss'
                  onClick={() => handleDismissFlag(flag.id)}
                  className='absolute right-3 top-3 text-primaryColor/70 hover:text-primaryColor transition-colors'
                >
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                    <path
                      d='M18 6L6 18M6 6l12 12'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 shrink-0'>
                    <InfoIcon color={getColorPalette().primaryColor} height='16' width='16' />
                  </div>
                  <p className='text-base font-medium text-primaryColor'>{flag.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='w-full overflow-x-auto overflow-y-auto h-[calc(100vh-260px)] rounded-lg border border-mediumGray  hide-scrollbar relative'>
          <table className='min-w-[900px] md:min-w-full table-auto curved-table sticky-header-table text-xs md:text-sm'>
            <thead className='bg-mediumGray uppercase sticky top-0 z-10'>
              {table.getHeaderGroups().map((hg, i) => (
                <tr key={i}>
                  {hg.headers.map((header, j) => {
                    const meta = (header.column.columnDef as any).meta as ColMeta | undefined
                    return (
                      <th
                        key={j}
                        colSpan={header.colSpan}
                        className={[
                          'sticky top-0 bg-mediumGray text-start text-black text-[10px] md:text-xs font-medium py-2 px-2 md:px-3 h-10',
                          meta?.mobileClass || '',
                        ].join(' ')}
                        style={{width: `${header.column.getSize()}px`}}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>

            {table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={baseColumns.length} className='text-center py-10'>
                    <div className='flex flex-col items-center gap-2 text-gray-600'>
                      <div>
                        📦 <span className='italic font-medium'>No ongoing production found.</span>
                      </div>
                      <p className='text-sm'>All active batches are either completed or shipped.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className='border-b border-lightgray'>
                    {row.getVisibleCells().map((cell) => {
                      const meta = (cell.column.columnDef as any).meta as ColMeta | undefined
                      return (
                        <td
                          key={cell.id}
                          className={['px-2 md:px-3 py-3 align-top', meta?.mobileClass || ''].join(
                            ' '
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        <div className='sticky bottom-0 left-0 right-0 bg-white border-t border-mediumGray py-2 px-3 flex items-center justify-between text-xs md:text-sm z-20'>
          <span className='text-textColor font-medium'>
            {totalAligners === 0 ? '0–0 from 0' : `${start}–${end} from ${totalAligners}`}
          </span>

          <Pagination
            showSizeChanger={false}
            current={pageNumber}
            defaultPageSize={pageSize}
            onChange={(page) => handleOnSearch({page})}
            total={totalPages * pageSize}
            size='small'
          />
        </div>
      </div>
    </Spin>
  )
}

export default TableContainerForAlignerProduction
