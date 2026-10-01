import {useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cn from '@utils/cn'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import {RowDataAuditLogList} from '../AccessControlList/types/accessControlList.types'
import moment from 'moment'
import NoCustomerFound from 'screens/Customers/CustomerList/components/NoCustomerFound'

const TableContainerForAuditLogs = ({
  pageNumber,
  handleOnSearch,
}: {
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
}) => {
  const {auditLogList, loadingAuditLogList} = useSelector((state: RootState) => state.accessControl)
  const data = auditLogList?.audit_logs || []
  const totalLogs = auditLogList?.pagination?.total_patients ?? 0
  const columns = useMemo<ColumnDef<RowDataAuditLogList>[]>(
    () => [
      {
        id: 'date_time',
        accessorKey: 'date_time',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full uppercase'>
                  <p>Date & Time</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex gap-2 items-center'>
                {row?.original?.date_time ? (
                  <div className='text-sm font-medium text-black'>
                    {moment(row?.original?.date_time).format('DD-MMM-YYYY, h:mm:ss A')}
                  </div>
                ) : (
                  '-'
                )}
              </div>
            </RenderCell>
          )
        },
        size: 200,
      },
      {
        id: 'user',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-normal text-xs',
              header: (
                <div className='flex justify-between items-center w-full uppercase'>
                  <p>User</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex flex-col text-sm font-medium text-black'>
                {row.original.user}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },

      {
        id: 'action',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>ACTION</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return <div>{getUpdates(row.original)}</div>
        },
      },
    ],
    [data]
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      return newSorting
    })
  }

  const table = useReactTable({
    columns,
    data,
    state: {sorting},
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-10rem)]'>
      <Spin indicator={<Spinner loading />} spinning={loadingAuditLogList}>
        <div className='w-full h-full border border-mediumGray rounded-lg'>
          <table className='table-auto w-full curved-table h-full'>
            <thead className='bg-mediumGray'>
              {table.getHeaderGroups().map((headerGroup, index: number) => (
                <tr key={index}>
                  {headerGroup.headers.map((header, index: number) => (
                    <th
                      key={index}
                      colSpan={header.colSpan}
                      className='text-start text-black text-xs font-medium py-2 px-3 h-10'
                      style={{width: `${header.column.getSize()}px`}}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
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
                            {{
                              asc: <ArrowUpDownIcon color1={'#666666'} color2={'#66666680'} />,
                              desc: <ArrowUpDownIcon color2={'#666666'} color1={'#66666680'} />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0]?.headers.length}
                    className='text-center py-4'
                  >
                    <NoCustomerFound title={'No audit logs found'} />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const className = cn(`border-b border-lightgray text-black text-base group`)
                  return (
                    <tr key={row.id} className={className}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='md:px-3 py-4'>
                          <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
            <tfoot className='border-t border-mediumGray'>
              <tr>
                <td colSpan={table.getHeaderGroups()[0]?.headers?.length} className='text-center'>
                  <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                    <p className='text-textColor text-sm font-medium'>
                      {Math.min((pageNumber - 1) * 10 + 1, totalLogs)}-
                      {Math.min(pageNumber * 10, totalLogs)} from {totalLogs}
                    </p>
                    <div className='md:hidden block'>
                      <Pagination
                        showSizeChanger={false}
                        defaultCurrent={pageNumber}
                        defaultPageSize={10}
                        showLessItems
                        onChange={(page) => {
                          handleOnSearch({
                            page,
                          })
                        }}
                        total={totalLogs}
                      />
                    </div>
                    <div className='hidden md:block'>
                      <Pagination
                        showSizeChanger={false}
                        defaultCurrent={pageNumber}
                        defaultPageSize={10}
                        onChange={(page) => {
                          handleOnSearch({
                            page,
                          })
                        }}
                        total={totalLogs}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForAuditLogs

const getUpdates = (row: RowDataAuditLogList) => {
  switch (row?.action) {
    case 'ROLE_CREATED':
      return `Role Created - ${row?.role_name}`
    case 'ROLE_UPDATED':
      return `Role Updated - ${row?.role_name}`
    case 'ROLE_DELETED':
      return `Role Deleted - ${row?.role_name}`
    case 'ROLE_ASSIGNED':
      return `Role Assigned - ${row?.user}`
    case 'PERMISSION_UPDATED':
      return `Permission Updated - ${row?.permission_name} x ${row?.module_name} x  ${row?.role_name}`
    default:
      return '-'
  }
}
