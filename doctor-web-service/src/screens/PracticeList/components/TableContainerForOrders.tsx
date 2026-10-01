import {useMemo, useState} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Table,
} from '@tanstack/react-table'
import type {Updater} from '@tanstack/react-table'
import {Pagination, Spin} from 'antd'
import moment from 'moment'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import {CustomerOrder} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import Spinner from 'components/spinner/Spinner'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import dayjs from 'dayjs'

import cn from '@utils/cn'
import ProductionIcon from 'assets/icons/ProductionIcon'
import {useNavigate} from 'react-router'

type TableContainerForOrdersProps = {
  pageNumber?: number
  handleOnSearch: (params: {updateLoadingState?: boolean; page?: number}) => void
}

const TableContainerForOrders = ({pageNumber, handleOnSearch}: TableContainerForOrdersProps) => {
  const {customerOrderDetail, loadingCustomerOrderDetail, customerOrderPagination} = useSelector(
    (state: RootState) => state.profile
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const navigate = useNavigate()
  const totalOrders = customerOrderPagination?.total_patients ?? 0
  const pageSize = customerOrderPagination?.page_size ?? 10
  const currentPage = pageNumber ?? 0 // zero-based index from API
  const [sorting, setSorting] = useState<SortingState>([])
  const getOrderViewPath = (order: CustomerOrder) =>
    serviceConfig?.VSP_PLANNING && order.patient_id
      ? `/vsp-profile/${order.patient_id}/case-details?order_id=${order.order_id}`
      : `/view-order/${order.order_id}`

  const formatOrderType = (orderType?: string | null) => {
    if (!orderType) return '-'
    const cleaned = orderType.replace(/_/g, ' ').toLowerCase()
    return cleaned.toUpperCase()
  }

  const columns = useMemo<ColumnDef<CustomerOrder>[]>(
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
        id: 'service_products',
        accessorKey: 'service_products',
        enableSorting: false,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>Service Product</div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const productNameRaw =
            row.original.product_name ?? (row.original.service_products as any)?.product_name
          const productName =
            typeof productNameRaw === 'string' && productNameRaw.trim() ? productNameRaw : '-'

          return (
            <RenderCell>
              <div className='text-sm font-medium text-black truncate'>{productName}</div>
            </RenderCell>
          )
        },
      },
      {
        id: 'order_type',
        accessorKey: 'order_type',
        enableSorting: false,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: <div className='flex justify-between items-center w-full'>Order Type</div>,
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm font-medium text-black truncate'>
                {formatOrderType(row?.original?.order_type as string)}
              </div>
            </RenderCell>
          )
        },
      },
      {
        id: 'order_creation_date',
        accessorKey: 'order_creation_date',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: <div className='flex justify-between items-center w-full'>Created On</div>,
            }}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium text-black truncate'>
              {row.original.order_creation_date
                ? moment(row.original.order_creation_date).format('DD-MMM-YYYY')
                : '—'}
            </div>
          </RenderCell>
        ),
      },
    ],
    [customerOrderDetail]
  )

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting(updater)
  }

  const table = useReactTable({
    data: customerOrderDetail,
    columns,
    state: {sorting},
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.order_id ?? `${row.patient_id}-${row.order_creation_date}`,
  })

  const TableHeader = (props: Table<CustomerOrder>) => {
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

  const TableBody = (props: Table<CustomerOrder>) => {
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
              onClick={() => navigate(getOrderViewPath(row.original))}
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
    <div className='border border-mediumGray rounded-lg max-h-[calc(60vh)] w-full overflow-scroll'>
      <Spin indicator={<Spinner loading />} spinning={loadingCustomerOrderDetail}>
        <table className='w-full'>
          <TableHeader {...table} />
          <TableBody {...table} />
        </table>

        <div className='border-t border-mediumGray bg-white sticky bottom-0 left-0 w-full z-10'>
          <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
            <p className='text-textColor text-sm font-medium'>
              {(totalOrders && currentPage * pageSize + 1) || 0}-
              {totalOrders ? Math.min((currentPage + 1) * pageSize, totalOrders) : 0} from{' '}
              {totalOrders}
            </p>
            <Pagination
              showSizeChanger={false}
              current={currentPage + 1}
              defaultPageSize={pageSize}
              onChange={(page) => {
                handleOnSearch({updateLoadingState: true, page: page - 1})
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
