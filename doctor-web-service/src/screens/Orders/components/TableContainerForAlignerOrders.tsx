import {useMemo, useState} from 'react'
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
  Table,
} from '@tanstack/react-table'
import cn from '@utils/cn'
import {useNavigate, useSearchParams} from 'react-router-dom'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import dayjs from 'dayjs'
import {Pagination, Select, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {ordersPageFilterBar, RowOrderDetails} from '../orders.types'
import ProductionIcon from 'assets/icons/ProductionIcon'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import OrderStatusTag from './OrderStatusTag'
import orderStatusConstants from '@constants/orderStatus.constants'

import AddDueDateContainer from './AddDueDateContainer'
import When from 'components/when/When'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useDispatchAction from '@hooks/useDispatchAction'
import {updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'

const TableContainerForAlignerOrders = ({
  patientProfile = false,
  pageNumber,
  handleOnSearch,
  filter,
  selectedSubWorkflow,
}: {
  patientProfile?: boolean
  pageNumber: number
  filter?: ordersPageFilterBar
  handleOnSearch: (params: {updateLoadingState?: boolean; page?: number}) => void
  selectedSubWorkflow?: string | undefined
}) => {
  const {
    alignerOrderList,
    loadingAlignerOrderList,
    activeUsers,
    updatingOrder,
    loadingActiveUsers,
  } = useSelector((state: RootState) => state.orders)
  const ordersList = alignerOrderList?.order_details
  const pagination = alignerOrderList?.pagination_details
  const navigation = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const totalOrders = pagination?.total_orders
  const {isOrganization, isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const [sorting, setSorting] = useState<SortingState>([])
  const {permissionChecks} = useFeatureAccess()
  const permissionsDueDate = permissionChecks?.practiceOrderManagement?.dueByDate
  const assignReAssignOrder = permissionChecks?.practiceOrderManagement?.assignReAssignOrder
  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      return newSorting
    })
  }

  const refreshData = () => {
    handleOnSearch({updateLoadingState: false})
  }
  const [searchParams] = useSearchParams()
  const isCustomerOrder = searchParams.get('customerOrders') === 'true'
  const columns = useMemo<ColumnDef<RowOrderDetails>[]>(
    () => [
      {
        id: 'patient_name',
        accessorKey: 'patient_name',
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
          return (
            <RenderCell>
              <div className='text-base font-medium text-black truncate ...'>
                {row.original.patient_name}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'order_id',
        accessorKey: 'order_id',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Order ID</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex gap-2 cursor-default items-center'>
                <div className='flex flex-col'>
                  <p className='text-black text-base font-semibold uppercase'>
                    #{row.original.order_id}
                  </p>
                  <p className='text-textColor font-medium text-xs'>
                    Created on: {dayjs(row.original.order_creation_date).format('DD-MMM-YYYY')}
                  </p>
                </div>
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },

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
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm text-textColor font-medium'>{row.original.doctor_name}</div>
            </RenderCell>
          )
        },
        size: 150,
      },

      {
        id: 'order_status',
        accessorKey: 'order_status',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Order status</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const order = row.original
          const manufacturing_status = order?.latest_manufacturing_response?.status ?? 'PENDING'
          const latest_manufacturing_status =
            manufacturing_status === 'DELIVERED' && order?.unprocessed_aligner_details?.count === 0
              ? 'MANUFACTURING_COMPLETED'
              : manufacturing_status

          const order_status =
            order && order?.order_status === 'COMPLETED'
              ? latest_manufacturing_status
              : order?.order_status

          return (
            <RenderCell>
              {(isPractice || isAlignerCompanyOrg) && row?.original?.is_practice_order ? (
                <OrderStatusTag
                  status={order_status}
                  isShowManufacturingStatus={true}
                  isShowDropdown={false}
                />
              ) : (
                <OrderStatusTag
                  status={order?.order_status}
                  isShowManufacturingStatus={false}
                  isShowDropdown={false}
                />
              )}
            </RenderCell>
          )
        },
        size: 150,
      },

      {
        id: 'order_due_by',
        accessorKey: 'order_due_by',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Due by</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<RowOrderDetails>}) => {
          return (
            <RenderCell>
              <When
                isTrue={
                  permissionChecks?.practiceOrderManagement?.dueByDate?.isViewable &&
                  row?.original?.order_status !== orderStatusConstants.CANCELLED &&
                  row?.original?.order_status !== orderStatusConstants.COMPLETED
                }
              >
                <div className=''>
                  <AddDueDateContainer
                    order_due_by={row?.original?.order_due_by}
                    order_id={row.original.order_id}
                    refreshData={refreshData}
                    permissions={permissionsDueDate}
                  />
                </div>
              </When>
            </RenderCell>
          )
        },
        size: 100,
      },
      ...(assignReAssignOrder?.isViewable
        ? [
            {
              id: 'assign_user',
              accessorKey: 'assign_user',
              enableSorting: false,
              header: ({}) => (
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-between items-center w-full'>
                        <p>Assigned User</p>
                      </div>
                    ),
                  }}
                />
              ),
              cell: ({row}: {row: Row<RowOrderDetails>}) => {
                return (
                  <RenderCell>
                    <div className='min-w-28'>
                      {assignReAssignOrder?.isViewable ? (
                        <Select
                          options={activeUsers}
                          disabled={
                            row.original.order_status === orderStatusConstants.CANCELLED ||
                            row.original.order_status === orderStatusConstants.NEED_MORE_INFO ||
                            (!assignReAssignOrder?.isAddable && !assignReAssignOrder?.isEditable)
                          }
                          loading={updatingOrder}
                          showSearch={true}
                          className='w-full'
                          onClick={(e) => e.stopPropagation()}
                          value={activeUsers.find(
                            (user) => user.value === row.original.assigned_lab_user_id
                          )}
                          placeholder='Select user'
                          dropdownRender={(menu) => (
                            <div>
                              <div className='text-textColor uppercase p-2 text-xs'>
                                Assign user
                              </div>
                              {menu}
                            </div>
                          )}
                          onChange={async (value) => {
                            dispatchAction(
                              updateOrder({
                                order_id: row.original.order_id,
                                doctor_id: row.original.doctor_id,
                                assigned_user_details: {
                                  assigned_user_profile_id: safeParseInt(value),
                                  assigned_user_name:
                                    activeUsers.find(
                                      (activeUser) => activeUser.value === safeParseInt(value)
                                    )?.label ?? '',
                                },

                                status:
                                  row.original?.order_status === 'ORDERED'
                                    ? 'IN_PROGRESS'
                                    : row.original?.order_status,
                              })
                            )
                              .unwrap()
                              .then(() => {
                                handleOnSearch({updateLoadingState: false})
                              })
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </div>
                  </RenderCell>
                )
              },
              size: 150,
            },
          ]
        : []),
    ],
    [ordersList, activeUsers, filter, patientProfile]
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
        patient_name: !patientProfile,
        doctor_name: !patientProfile && isOrganization,
        order_due_by: !patientProfile && isOrganization,
        assign_user: !patientProfile && isOrganization,
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

  const TableHeader = (props: Table<RowOrderDetails>) => {
    return (
      <thead>
        {props.getHeaderGroups().map((headerGroup, index: number) => (
          <tr key={index} className='sticky top-0 bg-lightGray'>
            {headerGroup.headers.map((header, index: number) => (
              <th
                key={index}
                colSpan={header.colSpan}
                className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'
              >
                <div
                  {...{
                    className: cn(
                      'flex items-center justify-between gap-2 w-full text-xs',
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

  const TableBody = (props: Table<RowOrderDetails>) => {
    const rows = props.getRowModel().rows
    if (rows.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={table.getHeaderGroups()[0]?.headers?.length} className='text-center py-4'>
              <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
                <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
                  <ProductionIcon color='#666666' width='32' height='32' />
                </div>
                <p>No orders added yet</p>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }
    return (
      <tbody>
        {rows.map((row) => {
          const className = cn(
            'border-b border-lightgray text-black text-base group cursor-pointer'
          )
          return (
            <tr
              key={row.id}
              className={className}
              onClick={() => {
                if (row.original.order_status === orderStatusConstants.DRAFT) {
                  navigation(
                    `/orders/create-order/${row.original.order_id}`,
                    hasValue(row.original.linked_order_id)
                      ? {replace: true, state: {isClone: true}}
                      : undefined
                  )
                  return
                } else {
                  if (isCustomerOrder) {
                    const queryParams = new URLSearchParams({
                      isCustomerOrder: 'true',
                    }).toString()
                    navigation(`/orders/${row.original.order_id}?${queryParams}`)
                  } else {
                    navigation(`/orders/${row.original.order_id}`)
                  }
                  return
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className='px-3 py-3'>
                  <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    )
  }
  return (
    <div className='border border-mediumGray rounded-lg max-h-[calc(100vh-100px)] w-full overflow-scroll'>
      {selectedSubWorkflow && (
        <div className='p-2 bg-white border-b border-mediumGray'>
          <div className='text-sm font-medium'>Viewing: {selectedSubWorkflow}</div>
        </div>
      )}
      <Spin
        indicator={<Spinner loading />}
        spinning={loadingAlignerOrderList || loadingActiveUsers}
      >
        <table className='w-full'>
          <TableHeader {...table} />
          <TableBody {...table} />
        </table>

        {/* Empty State */}

        {/* Footer */}
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
                handleOnSearch({updateLoadingState: true, page})
              }}
              total={totalOrders}
            />
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForAlignerOrders
