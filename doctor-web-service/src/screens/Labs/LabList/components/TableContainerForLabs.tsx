import {useMemo, useState} from 'react'
import type {MouseEvent} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import {Pagination, Spin} from 'antd'
import {useNavigate} from 'react-router-dom'
import Spinner from 'components/spinner/Spinner'
import moment from 'moment'
import PencilIcon from 'assets/icons/PencilIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import clsx from 'clsx'
import {Invitation} from '../types/labs.types'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import Tag from 'components/tags/Tag'
import {setDataEditLab} from 'redux/Slices/AppSlice/Labs/labs.slice'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import GetInviteButtonDetails from './GetInviteButtonDetails'
import ModalConfirmAcceptInvitations from 'screens/Labs/AddLab/components/ModalConfirmAcceptInvitations'
import ModalConfirmRejectInvitations from 'screens/Labs/AddLab/components/ModalConfirmRejectInvitations'
import When from 'components/when/When'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getImageUrlById, getSalutations} from 'utils/ConstFunctions'

const TableContainerForLabs = ({
  pageNumber,
  handleOnSearch,
  sendInvite,
  activeTab,
  isAccessible,
  isPractice = false,
}: {
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
  sendInvite: (lab: Invitation) => void
  activeTab: keyof typeof practiceFilterConstants
  isAccessible: boolean
  isPractice?: boolean
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {dataLabList, loadingLabList} = useSelector((state: RootState) => state.labs)
  const {isGrowthPlanUser} = useAllUserPlan()

  // ✅ Single list
  const data = useMemo(() => {
    return dataLabList?.doctor_invitation_details_list ?? []
  }, [dataLabList])
  const totalLabs =
    isPractice && activeTab === 'ACCEPTED' ? 1 : (dataLabList?.pagination?.total_patients ?? 0)

  const [sorting, setSorting] = useState<SortingState>([])

  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      return newSorting
    })
  }

  const columns = useMemo<ColumnDef<Invitation>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'first_name',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>NAME</p>
              </div>
            }
          />
        ),
        cell: ({row}) => {
          const salutation = row.original.salutation ?? ''
          const first_name = row.original.first_name
          const last_name = row.original.last_name ?? ''
          const full_name = `${getSalutations(salutation)} ${first_name} ${last_name}`
          const profile_url = row.original.profile_image_id
            ? getImageUrlById(row.original.profile_image_id)
            : row.original?.profile_url
          return (
            <RenderCell>
              <div className='flex gap-2 items-center'>
                {hasValue(profile_url) ? (
                  <Image
                    className='w-11 h-11 object-cover rounded-full'
                    src={profile_url}
                    showLoading={true}
                  />
                ) : (
                  <DefaultImage letter={first_name?.charAt(0)} />
                )}
                <div className='text-sm font-semibold text-black'>{full_name}</div>
                {row.original.admin && (
                  <Tag value={'ADMIN'} className='text-textColor bg-lightGray text-xs' />
                )}
              </div>
            </RenderCell>
          )
        },
        size: 200,
      },
      {
        id: 'email',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>EMAIL</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='flex flex-col text-sm font-medium text-black'>{row.original.email}</div>
          </RenderCell>
        ),
        size: 150,
      },
      {
        id: 'mobile_no',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>MOBILE NUMBER</p>
              </div>
            }
          />
        ),
        cell: ({row}) => {
          const country_code = row.original.country_code ?? ''
          const mobile_no = row.original.mobile_no
          const contact = `${country_code} ${mobile_no ?? ''}`.trim()
          return (
            <RenderCell>
              <div className={clsx('text-sm', hasValue(mobile_no) && 'text-black font-medium')}>
                {hasValue(mobile_no) ? contact : 'Mobile number not added'}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'added_on',
        accessorKey: 'invited_at',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>ADDED ON</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium break-all'>
              {hasValue(row.original.invited_at)
                ? moment(row.original.invited_at).format('DD-MMM-YYYY')
                : '--'}
            </div>
          </RenderCell>
        ),
        size: 100,
      },
      {
        id: 'invited_at',
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={
              <div className='flex justify-between items-center w-full'>
                <p>ACTIONS</p>
              </div>
            }
          />
        ),
        cell: ({row}) => (
          <>
            <When isTrue={!row.original.is_received_invitation && !isGrowthPlanUser}>
              <button
                onClick={() => {
                  if (!isAccessible) return
                  dispatchAction(setDataEditLab(row.original))
                  const queryParams = new URLSearchParams({edit: 'true'}).toString()
                  navigate(`/labs-add/${row.original.invitation_id}?${queryParams}`)
                }}
                className='flex gap-2 items-center'
              >
                <PencilIcon />
                <div className='text-sm text-textColor font-medium'>Edit</div>
              </button>
            </When>

            <div className='text-sm font-medium break-all'>
              <GetInviteButtonDetails lab={row.original} sendInvite={sendInvite} />
            </div>
          </>
        ),
        size: 50,
      },
    ],
    [data, activeTab, dispatchAction, isAccessible, navigate, sendInvite]
  )

  const table = useReactTable({
    columns,
    data: data,
    state: {
      sorting,
      columnVisibility: {
        status: activeTab === practiceFilterConstants.PENDING && !isGrowthPlanUser,
        ongoing_orders: activeTab === practiceFilterConstants.ACCEPTED,
        total_patients: activeTab === practiceFilterConstants.ACCEPTED,
      },
    },
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {size: 150, minSize: 50, enableSorting: true},
  })

  const rows = table.getRowModel().rows
  const showEmpty = rows.length === 0

  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-10rem)]'>
      <ModalConfirmAcceptInvitations />
      <ModalConfirmRejectInvitations />

      <Spin indicator={<Spinner loading />} spinning={loadingLabList}>
        <div className='w-full h-full border border-mediumGray rounded-lg'>
          <table className='table-auto w-full curved-table h-full'>
            <thead className='bg-mediumGray uppercase'>
              {table.getHeaderGroups().map((headerGroup, index: number) => (
                <tr key={index}>
                  {headerGroup.headers.map((header, i: number) => (
                    <th
                      key={i}
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

            {/* Empty State (centered) */}
            {showEmpty ? (
              <tbody>
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0]?.headers.length}
                    className='py-8 align-middle'
                  >
                    <div className='flex flex-col gap-2 items-center justify-center text-center h-[45vh] px-4'>
                      <p className='text-base text-black font-medium'>No labs connected yet</p>

                      <p className='text-sm text-textColor max-w-[560px]'>
                        Once a lab sends you a connection request, it will appear here for your
                        approval
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {rows.map((row) => {
                  const handleRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
                    const target = e.target as HTMLElement
                    if (target.closest('button') || target.closest('a')) return
                    const id = row.original.profile_id
                    if (!id) return
                    navigate(`/practice-lab-profile/${id}`, {state: row.original})
                  }

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-lightgray text-black text-base group',
                        isPractice && 'cursor-pointer'
                      )}
                      onClick={handleRowClick}
                    >
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

            {/* Footer */}
            {!showEmpty && (
              <tfoot className='border-t border-mediumGray'>
                <tr>
                  <td colSpan={table.getHeaderGroups()[0]?.headers.length} className='text-center'>
                    <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                      <p className='text-textColor text-sm font-medium'>
                        {Math.min((pageNumber - 1) * 10 + 1, totalLabs)}-
                        {Math.min(pageNumber * 10, totalLabs)} from {totalLabs}
                      </p>
                      <div className='md:hidden block'>
                        <Pagination
                          showSizeChanger={false}
                          defaultCurrent={pageNumber}
                          defaultPageSize={10}
                          showLessItems
                          onChange={(page) => handleOnSearch({page})}
                          total={totalLabs}
                        />
                      </div>
                      <div className='hidden md:block'>
                        <Pagination
                          showSizeChanger={false}
                          defaultCurrent={pageNumber}
                          defaultPageSize={10}
                          onChange={(page) => handleOnSearch({page})}
                          total={totalLabs}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Spin>
    </div>
  )
}

export default TableContainerForLabs
