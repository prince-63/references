import When from 'components/when/When'
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
import useDispatchAction from '@hooks/useDispatchAction'
import {updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import useAllUserPlan from '@hooks/useAllUserPlan'
import AddDueDateContainer from './AddDueDateContainer'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const TableContainerForOrders = ({
  pageNumber,
  patientProfile = false,
  handleOnSearch,
  filter,
}: {
  pageNumber: number
  patientProfile?: boolean
  filter?: ordersPageFilterBar
  handleOnSearch: (params: {updateLoadingState?: boolean; page?: number}) => void
}) => {
  const {orderList, loadingOrderList, activeUsers, loadingActiveUsers, updatingOrder} = useSelector(
    (state: RootState) => state.orders
  )
  const ordersList = orderList?.order_details
  const pagination = orderList?.pagination_details
  const navigation = useNavigate()
  const totalOrders = pagination?.total_orders
  const {isOrganization, isDesignLabUser, isVendor, isEnterprisePlanUser, isPractice} =
    useAllUserPlan()
  const [sorting, setSorting] = useState<SortingState>([])
  const {dispatchAction} = useDispatchAction()
  const {permissionChecks} = useFeatureAccess()

  const permissionsDueDate =
    permissionChecks?.practiceOrderManagement?.dueByDate ||
    permissionChecks?.customerOrderManagement?.dueByDate

  const assignReAssignOrder = permissionChecks?.customerOrderManagement?.assignReAssignOrder
  const assignReassignOrder =
    assignReAssignOrder?.isViewable && (filter?.CUSTOMER || filter?.RECEIVED)

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
        cell: ({row}: {row: Row<RowOrderDetails>}) => {
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
        id: 'customer_order_id',
        accessorKey: 'customer_order_id',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  {(filter?.RECEIVED || filter?.SENT || filter?.CUSTOMER) && (
                    <p>Customer Order ID</p>
                  )}
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
                    {filter?.RECEIVED || filter?.CUSTOMER
                      ? row.original.order_id
                      : row.original?.linked_order_id}
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
        id: 'linked_order_id',
        accessorKey: 'linked_order_id',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  {(filter?.RECEIVED || filter?.SENT || filter?.CUSTOMER) && (
                    <p>Purchase Order ID</p>
                  )}
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <When isTrue={hasValue(row.original.linked_order_id)}>
                <div className='flex gap-2 cursor-default items-center'>
                  <div className='flex flex-col'>
                    <a
                      className='text-primaryColor text-base font-semibold uppercase underline cursor-pointer hover:text-primaryColor'
                      onClick={(e) => {
                        e.stopPropagation()
                        navigation(
                          `/orders/${
                            filter?.SENT ? row.original.order_id : row.original.linked_order_id
                          }`
                        )
                      }}
                    >
                      {filter?.SENT ? row.original.order_id : row.original.linked_order_id}
                    </a>
                    <p className='text-textColor font-medium text-xs'>Planning order</p>
                  </div>
                </div>
              </When>
              <When
                isTrue={
                  !hasValue(filter?.SENT ? row.original?.order_id : row.original.linked_order_id)
                }
              >
                <p>--</p>
              </When>
            </RenderCell>
          )
        },
        size: 150,
      },
      ...(!patientProfile
        ? [
            {
              id: 'order_type',
              accessorKey: 'order_type',
              enableSorting: true,
              header: ({}) => (
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-between items-center w-full  '>
                        <p>Order type</p>
                      </div>
                    ),
                  }}
                />
              ),
              cell: ({row}: {row: Row<RowOrderDetails>}) => {
                return (
                  <RenderCell>
                    <div className='text-sm text-textColor font-medium'>
                      {row.original.order_type === 'PLANNING_ORDER'
                        ? 'Planning order'
                        : 'Scanning order'}
                    </div>
                  </RenderCell>
                )
              },
              size: 150,
            },
          ]
        : []),

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
                  <p>
                    {isDesignLabUser || isEnterprisePlanUser || isVendor ? 'Customer' : 'Practice'}
                  </p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}: {row: Row<RowOrderDetails>}) => {
          return (
            <RenderCell>
              <div className='text-sm text-textColor font-medium'>{row.original.doctor_name}</div>
            </RenderCell>
          )
        },
        size: 150,
      },

      ...(filter?.SENT && (isOrganization || isEnterprisePlanUser)
        ? [
            {
              id: 'vendor_name',
              accessorKey: 'vendor_name',
              enableSorting: true,
              header: ({}) => (
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-between items-center w-full  '>
                        <p>{isEnterprisePlanUser ? 'Lab' : 'Vendor'}</p>
                      </div>
                    ),
                  }}
                />
              ),
              cell: ({row}: {row: Row<RowOrderDetails>}) => {
                return (
                  <RenderCell>
                    <div className='text-sm text-textColor font-medium'>
                      {row.original.lab_display_name}
                    </div>
                  </RenderCell>
                )
              },
              size: 150,
            },
          ]
        : []),
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
          return (
            <RenderCell>
              <OrderStatusTag
                status={row.original.order_status}
                isShowManufacturingStatus={false}
                isShowDropdown={false}
              />
            </RenderCell>
          )
        },
        size: 150,
      },
      ...(filter?.CUSTOMER || filter?.RECEIVED || (isDesignLabUser && !isEnterprisePlanUser)
        ? [
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
          ]
        : []),
      ...(assignReassignOrder
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
    [ordersList, activeUsers, filter, isCustomerOrder, assignReassignOrder]
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
        doctor_name: !patientProfile && (isDesignLabUser || isOrganization),
        patient_name: !patientProfile,
        customer_order_id: !patientProfile && isOrganization,
        linked_order_id: !patientProfile && isOrganization,
        order_id: patientProfile || (!isPractice && !isOrganization),
        order_type: patientProfile,
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
          <tr key={index} className='bg-lightGray sticky top-0 z-10'>
            {headerGroup.headers.map((header, index: number) => (
              <th
                key={index}
                colSpan={header.colSpan}
                className='text-xs font-medium uppercase px-2 py-3'
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
        {props.getRowModel().rows.map((row) => {
          const className = cn(
            `border-b border-lightgray text-black text-base group cursor-pointer`
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
    <div className='border border-mediumGray rounded-lg max-h-[calc(100vh-250px)] w-full overflow-scroll'>
      <Spin indicator={<Spinner loading />} spinning={loadingOrderList || loadingActiveUsers}>
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
                if (handleOnSearch) {
                  handleOnSearch({updateLoadingState: true, page: page})
                }
              }}
              total={totalOrders}
            />
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForOrders
