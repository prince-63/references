import cn from '@utils/cn'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {Modal, Pagination, Spin} from 'antd'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import Spinner from 'components/spinner/Spinner'
import {useMemo, useState} from 'react'
import {CreateCaseTeamResponse} from 'redux/Slices/AppSlice/CaseTeam/caseTeam.slice'
import NoCustomerFound from 'screens/Customers/CustomerList/components/NoCustomerFound'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import moment from 'moment'

interface CaseTeamsTableProps {
  caseTeams: CreateCaseTeamResponse[]
  loading: boolean
  pageNumber: number
  pageSize: number
  totalCaseTeams: number
  onPageChange: ({page}: {page: number}) => void
}

const CaseTeamsTable = ({
  caseTeams,
  loading,
  pageNumber,
  pageSize,
  totalCaseTeams,
  onPageChange,
}: CaseTeamsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedTeam, setSelectedTeam] = useState<CreateCaseTeamResponse | null>(null)

  const openTeamInfoModal = (team: CreateCaseTeamResponse) => {
    setSelectedTeam(team)
  }

  const closeTeamInfoModal = () => {
    setSelectedTeam(null)
  }

  const columns = useMemo<ColumnDef<CreateCaseTeamResponse>[]>(
    () => [
      {
        id: 'team_name',
        accessorKey: 'team_name',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>TEAM NAME</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <button
              type='button'
              onClick={() => openTeamInfoModal(row.original)}
              className='text-sm font-semibold text-primaryColor hover:underline text-left'
            >
              {row.original.team_name}
            </button>
          </RenderCell>
        ),
        size: 170,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>DESCRIPTION</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-normal text-textColor'>
              {row.original.description?.trim() || '--'}
            </div>
          </RenderCell>
        ),
        size: 220,
      },
      {
        id: 'members',
        accessorKey: 'members',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>MEMBERS</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium text-black'>
              {row.original.member_count} member{row.original.member_count === 1 ? '' : 's'}
            </div>
          </RenderCell>
        ),
        size: 170,
      },
      {
        id: 'created_by',
        accessorKey: 'created_by.name',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>CREATED BY</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium text-black'>
              {row.original.created_by?.name || '--'}
            </div>
            <div className='text-xs font-normal text-textColor'>
              {row.original.created_by?.email || '--'}
            </div>
          </RenderCell>
        ),
        size: 180,
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>CREATED ON</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium text-black'>
              {row.original.created_at
                ? moment(row.original.created_at).format('DD-MMM-YYYY')
                : '--'}
            </div>
          </RenderCell>
        ),
        size: 120,
      },
    ],
    []
  )

  const table = useReactTable({
    columns,
    data: caseTeams,
    state: {sorting},
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {size: 150, minSize: 50},
  })

  return (
    <>
      <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-12rem)]'>
        <Spin indicator={<Spinner loading />} spinning={loading}>
          <div className='w-full h-full border border-mediumGray rounded-lg'>
            <table className='table-auto w-full curved-table h-full'>
              <thead className='bg-mediumGray'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className='text-start text-black text-xs font-medium py-2 px-3 h-10'
                        style={{width: `${header.column.getSize()}px`}}
                      >
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div
                            className={cn(
                              'flex gap-2 w-full',
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
                      <NoCustomerFound title='No case teams found' />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className='border-b border-lightgray text-black text-base'>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='md:px-3 py-4'>
                          <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}

              <tfoot className='border-t border-mediumGray'>
                <tr>
                  <td colSpan={table.getHeaderGroups()[0]?.headers?.length} className='text-center'>
                    <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                      <p className='text-textColor text-sm font-medium'>
                        {totalCaseTeams === 0
                          ? '0-0'
                          : `${Math.min((pageNumber - 1) * pageSize + 1, totalCaseTeams)}-${Math.min(
                              pageNumber * pageSize,
                              totalCaseTeams
                            )}`}{' '}
                        from {totalCaseTeams}
                      </p>
                      <div className='md:hidden block'>
                        <Pagination
                          showSizeChanger={false}
                          current={pageNumber}
                          pageSize={pageSize}
                          showLessItems
                          onChange={(page) => onPageChange({page})}
                          total={totalCaseTeams}
                        />
                      </div>
                      <div className='hidden md:block'>
                        <Pagination
                          showSizeChanger={false}
                          current={pageNumber}
                          pageSize={pageSize}
                          onChange={(page) => onPageChange({page})}
                          total={totalCaseTeams}
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

      <Modal
        title='Case Team Information'
        open={Boolean(selectedTeam)}
        onCancel={closeTeamInfoModal}
        footer={null}
        destroyOnClose
      >
        <div className='flex flex-col gap-3'>
          <div>
            <p className='text-xs font-medium text-textColor uppercase'>Team Name</p>
            <p className='text-base font-semibold text-black'>{selectedTeam?.team_name || '--'}</p>
          </div>
          <div>
            <p className='text-xs font-medium text-textColor uppercase'>Description</p>
            <p className='text-sm font-normal text-textColor'>
              {selectedTeam?.description?.trim() || '--'}
            </p>
          </div>
          <div>
            <p className='text-xs font-medium text-textColor uppercase'>Members</p>
            <p className='text-sm font-normal text-textColor'>
              {selectedTeam?.members?.length
                ? selectedTeam.members.map((member) => member.name).join(', ')
                : '--'}
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CaseTeamsTable
