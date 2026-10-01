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
  Table,
} from '@tanstack/react-table'
import cn from '@utils/cn'
import {useNavigate, useSearchParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import dayjs from 'dayjs'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import ProductionIcon from 'assets/icons/ProductionIcon'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'

const TableContainerForCancelled = () => {
  const {loadingTaskList, cancelledInvites} = useSelector((state: RootState) => state.kanban)
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()

  const [sorting, setSorting] = useState<SortingState>([])
  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      return newSorting
    })
  }

  useSearchParams()
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'patient',
        accessorKey: 'patient_name',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>Patient Name</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-base font-medium text-black truncate ...'>
              <div>{row.original?.patient_name ?? '-'}</div>
              <div className='text-xs text-textColor'>
                {row.original?.gender ? `${row.original.gender}, ${row.original?.age ?? ''}` : ''}
              </div>
            </div>
          </RenderCell>
        ),
        size: 220,
      },
      {
        id: 'id',
        accessorKey: 'patient_id',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>ID</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium'>#{row.original?.patient_id ?? '-'}</div>
          </RenderCell>
        ),
        size: 120,
      },
      {
        id: 'clinic',
        accessorKey: 'clinic',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Clinic</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm text-textColor'>{row.original?.clinic ?? '-'}</div>
          </RenderCell>
        ),
        size: 180,
      },
      {
        id: 'product',
        accessorKey: 'product',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Product</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium'>{row.original?.product ?? '-'}</div>
          </RenderCell>
        ),
        size: 150,
      },
      {
        id: 'case_type',
        accessorKey: 'case_type',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Case Type</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>{row.original?.case_type ?? '-'}</div>
          </RenderCell>
        ),
        size: 140,
      },
      {
        id: 'tags',
        accessorKey: 'tags',
        enableSorting: false,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Tags</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='flex gap-2 flex-wrap'>
              {(row.original?.tags || []).slice(0, 5).map((t: any, i: number) => (
                <span
                  key={i}
                  className='inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full'
                >
                  {t}
                </span>
              ))}
            </div>
          </RenderCell>
        ),
        size: 200,
      },
      {
        id: 'created_by',
        accessorKey: 'created_by',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>Created by</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>{row.original?.created_by ?? '-'}</div>
          </RenderCell>
        ),
        size: 160,
      },
      {
        id: 'created_on',
        accessorKey: 'created_on',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>Created on</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm text-textColor'>
              {row.original?.created_on
                ? dayjs(row.original.created_on).format('DD MMM, YYYY')
                : '-'}
            </div>
          </RenderCell>
        ),
        size: 140,
      },
      {
        id: 'follow_up_date',
        accessorKey: 'follow_up_date',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>Follow up date</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>
              {row.original?.follow_up_date
                ? dayjs(row.original.follow_up_date).format('DD MMM, YYYY')
                : '-'}
            </div>
          </RenderCell>
        ),
        size: 140,
      },
      {
        id: 'stage',
        accessorKey: 'stage',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Stage</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>
              <span className='px-3 py-1 bg-gray-100 rounded-md'>{row.original?.stage ?? '-'}</span>
            </div>
          </RenderCell>
        ),
        size: 140,
      },
      {
        id: 'assignee',
        accessorKey: 'assignee',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Assignee</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>{row.original?.assignee ?? '-'}</div>
          </RenderCell>
        ),
        size: 160,
      },
    ],
    [cancelledInvites]
  )
  const tableOptions = {
    columns: columns,
    data: cancelledInvites,
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

  const table = useReactTable(tableOptions)

  const TableHeader = (props: Table<any>) => {
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

  const TableBody = (props: Table<any>) => {
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
                const patientId = row.original?.patient_id
                if (patientId) navigation(`${profileBasePath}/${patientId}`)
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
      {/* selectedSubWorkflow removed; keep header area minimal */}
      <Spin indicator={<Spinner loading />} spinning={loadingTaskList}>
        <table className='w-full'>
          <TableHeader {...table} />
          <TableBody {...table} />
        </table>
      </Spin>
    </div>
  )
}

export default TableContainerForCancelled
