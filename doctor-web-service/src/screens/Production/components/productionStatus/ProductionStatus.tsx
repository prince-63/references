import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import DownArrowIcon from 'assets/icons/DownArrowIcon'
import {useMemo, useState} from 'react'
import {
  IProductionOrderRowData,
  ProductionFilter,
  ProductionFilterOptionsWithoutAllOrders,
} from 'screens/Production/types/productionModule.types'
import {IProductionOrder} from 'screens/Production/types/productionOrders.interface'

import useMappedOrders from './hooks/useMappedOrders'

import GroupedAlignerRowsWrapper from '../allOrders/components/orderListItem/components/alignerRows/GroupedAlignerRowsWrapper'

import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import GroupedAlignerRowsWrapperForInManufacturing from '../allOrders/components/orderListItem/components/GroupedAlignerRowsWrapperForInManufacturing'
import moment from 'moment'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import productionStatusTypesConstants from '@constants/productionStatusTypes.constants'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {SVG_PAGINATION_NEXT, SVG_RIGHT_ARROW_ICON} from 'utils/SvgConstants'
import DueMessage from '../DueMessage'
import {useNavigate} from 'react-router-dom'
import FiltersManufacturing from './FiltersManufacturing'
import {getCurrentAligner} from 'utils/getCurrentAligner'
import {identifyUser} from 'utils/ConstFunctions'

const ProductionStatus = ({
  productionOrders,
  filter,
}: {
  productionOrders: IProductionOrder[]
  filter: ProductionFilter
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [chosenStates, setChosenStates] = useState({
    IN_PRINTING: false,
    IN_PRODUCTION: false,
    IN_TRANSIT: false,
  })

  const handleClick = (e: any) => {
    setChosenStates((prev) => {
      return {...prev, [e.target.name]: e.target.checked}
    })
  }

  const activeFilter = getActiveFilter<ProductionFilterOptionsWithoutAllOrders>({
    filter,
  })
  const formatDate = (date: string) => {
    return moment(date, 'YYYY-MM-DD').format('DD MMM YYYY')
  }

  const navigation = useNavigate()
  const columns = useMemo<ColumnDef<IProductionOrderRowData>[]>(
    () => [
      {
        id: 'patientName',
        header: () => <div className='flex gap-1'>Patient name</div>,
        accessorKey: 'patientName',
        cell: ({row}) => {
          return (
            <div className='text-base font-normal'>
              {row.original.patient.first_name +
                ' ' +
                (hasValue(row.original.patient.last_name) ? row.original.patient.last_name : '')}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        id: 'orderDescription',
        header: 'Order description',
        accessorKey: 'orderDescription',
        cell: ({row}) => {
          return (
            <div>
              {activeFilter !== productionStatusTypesConstants.IN_MANUFACTURING && (
                <GroupedAlignerRowsWrapper
                  {...{
                    groupedAligners: row.original.orderDescription[activeFilter],
                  }}
                />
              )}
              {activeFilter === productionStatusTypesConstants.IN_MANUFACTURING && (
                <GroupedAlignerRowsWrapperForInManufacturing
                  inManufacturingItems={row.original.orderDescription[activeFilter]}
                />
              )}
            </div>
          )
        },
        enableSorting: false,
        size: 600,
      },
      {
        id: 'orderStartDate',
        header: 'Start date of order',
        accessorKey: 'orderStartDate',
        cell: ({row}) => (
          <div className='text-textColor flex flex-col'>
            <p className='font-semibold text-sm '>
              {formatDate(row.original.orderStartDate ?? '')}
            </p>
            <DueMessage {...{date: row.original.orderStartDate}} />
          </div>
        ),
        size: 210,
      },
      {
        id: 'alignerBrand',
        header: 'Aligner Brand',
        accessorKey: 'alignerBrand',
        cell: ({row}) => <p>{row.original.alignerBrand}</p>,
        enableSorting: false,
      },
      {
        id: 'currentAligner',
        header: 'Current aligner',
        accessorKey: 'currentAligner',
        cell: ({row}) => {
          const currentAligner = getCurrentAligner(row.original.alignerJourney)
          return (
            <div>
              <div>
                <span className='capitalize'>
                  {getCurrentAligner(row.original.alignerJourney)?.jaw_type}
                </span>{' '}
                {row.original.alignerJourney.current_aligner_no} of{' '}
                {row.original.alignerJourney.total_aligners}
              </div>
              <DueMessage {...{date: currentAligner?.end_date}} />
            </div>
          )
        },
        enableSorting: false,
      },
      {
        id: 'action',
        header: 'Action',
        accessorKey: 'action',
        cell: ({row}) => (
          <div className='show-profile'>
            <AntdButton
              text={
                <div className='flex items-center gap-2'>
                  <p className=''>View profile</p>
                  <SVG_RIGHT_ARROW_ICON />
                </div>
              }
              className='px-2.5 py-2 text-sm h-8 flex items-center font-semibold text-textColor'
              onClick={async () => {
                identifyUser()
                const patientId = row.original.patient.id
                navigation(`/profile/${patientId}/aligner-tracking`)
              }}
            />
          </div>
        ),

        enableSorting: false,
      },
    ],
    [productionOrders]
  )

  const mappedOrders = useMappedOrders({productionOrders, status: activeFilter})
  const filteredOrders = useMemo(
    () =>
      mappedOrders.filter((order) => {
        if (!chosenStates.IN_PRINTING && !chosenStates.IN_PRODUCTION && !chosenStates.IN_TRANSIT) {
          return true
        }
        let finalState = false
        if (chosenStates.IN_PRINTING) {
          finalState = finalState || !!order.orderDescription.IN_MANUFACTURING?.IN_PRINTING
        }
        if (chosenStates.IN_PRODUCTION) {
          finalState = finalState || !!order.orderDescription.IN_MANUFACTURING?.IN_PRODUCTION
        }
        if (chosenStates.IN_TRANSIT) {
          finalState = finalState || !!order.orderDescription.IN_MANUFACTURING?.IN_TRANSIT
        }
        return finalState
      }),
    [mappedOrders, chosenStates]
  )

  const counts = {
    IN_PRINTING: 0,
    IN_PRODUCTION: 0,
    IN_TRANSIT: 0,
  }

  // Iterate over the orders and update counts for each status category
  mappedOrders.forEach((order) => {
    if (!!order.orderDescription.IN_MANUFACTURING?.IN_PRINTING) {
      counts.IN_PRINTING++
    }
    if (!!order.orderDescription.IN_MANUFACTURING?.IN_PRODUCTION) {
      counts.IN_PRODUCTION++
    }
    if (!!order.orderDescription.IN_MANUFACTURING?.IN_TRANSIT) {
      counts.IN_TRANSIT++
    }
  })

  const table = useReactTable({
    columns,
    data: activeFilter === 'IN_MANUFACTURING' ? filteredOrders : mappedOrders,
    state: {sorting},
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: {
      size: 150,
      minSize: 50,
    },
    initialState: {
      columnVisibility: {
        orderStartDate:
          activeFilter === productionStatusTypesConstants.UNPROCESSED ||
          activeFilter === productionStatusTypesConstants.IN_MANUFACTURING,
      },
    },
  })

  const ordersLength =
    activeFilter === 'IN_MANUFACTURING' ? filteredOrders.length : mappedOrders.length
  const {pageIndex, pageSize} = table.getState().pagination
  let startItemIndex = 0
  let endItemIndex = 0

  if (ordersLength > 0) {
    startItemIndex = pageIndex * pageSize + 1
    endItemIndex = Math.min((pageIndex + 1) * pageSize, ordersLength)
  }

  return (
    <div className='h-[calc(100vh-4rem)]'>
      <div className='w-full flex flex-col h-full'>
        <When isTrue={activeFilter === 'IN_MANUFACTURING'}>
          <FiltersManufacturing onClick={handleClick} counts={counts} chosenState={chosenStates} />
        </When>

        <div className='overflow-y-auto card-wrapper'>
          <table className='table-auto w-full  '>
            <thead>
              {table.getHeaderGroups().map((headerGroup, index: number) => (
                <tr key={index} className='border-b bottom-2 border-textColor'>
                  {headerGroup.headers.map((header, index: number) => {
                    return (
                      <th
                        className={`text-start text-black text-sm font-medium py-2 px-4`}
                        key={index}
                        colSpan={header.colSpan}
                        style={{width: `${header.column.getSize()}px`}}
                      >
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          <div className='flex gap-2'>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <DownArrowIcon className='transform rotate-180' />,
                              desc: <DownArrowIcon />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const className = `border-b border-mediumGray text-black text-base hover:bg-primarySupport transition-colors duration-300}`
                return (
                  <tr key={row.id} className={className}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id} className=' px-4'>
                          <div className='py-4 text-textColor '>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div>
          <When isTrue={hasValue(mappedOrders)}>
            <div className='flex m-5 justify-between '>
              <div className='w-96 text-textColor text-sm font-medium leading-tight tracking-tight'>
                Showing {startItemIndex}-{endItemIndex} from {ordersLength}
              </div>
              <div className='flex gap-2 mb-4'>
                <button
                  className='flex justify-center items-center h-full transform rotate-180 cursor-pointer mr-2.5'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <SVG_PAGINATION_NEXT />
                </button>
                {Array.from(
                  {length: Math.ceil(ordersLength / pageSize)},
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`${
                      pageIndex + 1 === page
                        ? 'w-8 h-8 p-1.5 rounded-lg text-center bg-primaryColor text-white text-sm font-semibold leading-tight tracking-tight'
                        : 'w-8 h-8 p-1.5 rounded-lg text-center bg-primarySupport text-primaryColor text-sm font-semibold leading-tight tracking-tight'
                    } px-3`}
                    onClick={() => table.setPageIndex(page - 1)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className='flex justify-center items-center h-full cursor-pointer ml-2.5'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <SVG_PAGINATION_NEXT />
                </button>
              </div>
            </div>
          </When>
        </div>
      </div>
    </div>
  )
}

export default ProductionStatus
