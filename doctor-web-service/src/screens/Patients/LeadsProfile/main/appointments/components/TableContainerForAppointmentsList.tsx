import {useMemo, useState} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import dayjs from 'dayjs'
import {outletContext, RowDataForAppointmentsList} from '../types/appointments.types'
import useMappedAppointmentsList from '../utils/useMappedAppointments'
import {Popover, Spin} from 'antd'
import AppointmentRowActions from './AppointmentRowActions'
import ColorIcon from 'components/colorIcon/ColorIcon'
import DownArrowIcon from 'assets/icons/DownArrowIcon'
import NoAppointmentsFound from './NoAppointmentsFound'
import {useOutletContext} from 'react-router-dom'
import Spinner from 'components/spinner/Spinner'
const TableContainerForAppointmentsList = () => {
  const {appointmentsList, loadingAppointmentsList} = useSelector(
    (state: RootState) => state.appointments
  )

  const appointmentRows = useMappedAppointmentsList({appointments: appointmentsList})
  const {filter} = useOutletContext<outletContext>()

  const columns = useMemo<ColumnDef<RowDataForAppointmentsList>[]>(
    () => [
      {
        id: 'date',
        accessorKey: 'start_date',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>DATE</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex gap-3 items-center text-sm font-medium text-black'>
                {dayjs(row.original.start_date).format('DD MMM YYYY')}
              </div>
            </RenderCell>
          )
        },
        size: 120,
      },
      {
        id: 'timeSlot',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>TIME SLOT</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex flex-col text-sm font-medium'>
                {dayjs(row.original.start_date).format('hh:mm A')} to{' '}
                {dayjs(row.original.end_date).format('hh:mm A')}
              </div>
            </RenderCell>
          )
        },
      },
      {
        id: 'notes',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>NOTES FOR SELF</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm font-medium break-all'>
                {hasValue(row.original.notes) ? row.original.notes : 'Not added'}
              </div>
            </RenderCell>
          )
        },
        size: 350,
      },
      {
        id: 'actions',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>ACTIONS</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const [openPopover, setOpenPopover] = useState(false)
          return (
            <Popover
              content={
                <AppointmentRowActions
                  {...{setOpenPopover, selectedAppointment: row.original, table}}
                />
              }
              overlayInnerStyle={{padding: '4px', fontFamily: 'figtree'}}
              placement='left'
              open={openPopover}
              trigger={['click']}
              onOpenChange={(open) => {
                if (open) {
                  row.toggleSelected(true)
                } else {
                  row.toggleSelected(false)
                }
                setOpenPopover(open)
              }}
              className='transition ease-in-out duration-200'
            >
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className='flex gap-[1.78px] px-2 py-1'
              >
                <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
                <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
                <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
              </button>
            </Popover>
          )
        },
        size: 1,
      },
    ],
    [appointmentRows]
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      if (newSorting.length === 0) {
        return []
      }
      const {id} = newSorting[0]
      const isPastOrAllFilter = filter.PAST || filter.ALL

      if (prevSorting.length > 0 && prevSorting[0].id === id) {
        if (prevSorting[0].desc === !isPastOrAllFilter) {
          // Reset sorting if the same column is clicked twice in a row
          return []
        }
        return [{id, desc: isPastOrAllFilter ? prevSorting[0].desc : !prevSorting[0].desc}]
      }
      return [{id, desc: !isPastOrAllFilter}]
    })
  }
  const table = useReactTable({
    columns,
    data: appointmentRows,
    state: {sorting},
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 150,
      minSize: 50,
    },
  })
  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-14rem)]'>
      <Spin indicator={<Spinner loading />} spinning={loadingAppointmentsList}>
        <When isTrue={hasValue(appointmentRows)}>
          <table className='table-auto w-full curved-table h-full'>
            <thead className='bg-[#F5F5F5]'>
              {table.getHeaderGroups().map((headerGroup, index: number) => (
                <tr key={index} className='    '>
                  {headerGroup.headers.map((header, index: number) => {
                    return (
                      <th
                        className={`text-start text-black text-xs font-medium p-2`}
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
                          <div
                            className={cn(
                              'flex gap-2 w-full ',
                              header.column.getIsLastColumn() ? '' : 'border-r-2 border-mediumGray'
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <div className='mr-2'>
                              {{
                                asc: <DownArrowIcon className='transform rotate-180' />,
                                desc: <DownArrowIcon />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
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
                const isSelected = row.getIsSelected()

                const getBackgroundColorClass = () => {
                  if (isSelected) return 'bg-secondarySupport'
                  else return 'hover:bg-primarySupport'
                }

                const className = cn(
                  `border-b border-lightgray text-black text-base group`,
                  getBackgroundColorClass()
                )
                return (
                  <tr key={row.id} className={className}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id} className=' md:px-4 cursor-pointer'>
                          <div className='py-4'>
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
        </When>
        <When isTrue={!hasValue(appointmentRows)}>
          <NoAppointmentsFound />
        </When>
      </Spin>
    </div>
  )
}

export default TableContainerForAppointmentsList
