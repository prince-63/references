import {useMemo, useState} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
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
import {setDataEditCustomer} from 'redux/Slices/AppSlice/Customers/customers.slice'
import moment from 'moment'
import PencilIcon from 'assets/icons/PencilIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import NoCustomerFound from './NoCustomerFound'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import clsx from 'clsx'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import customerFilterConstants from '@constants/customerFilter.constants'
import When from 'components/when/When'
import Tag from 'components/tags/Tag'
import ModalConfirmAcceptInvitations from 'screens/Labs/AddLab/components/ModalConfirmAcceptInvitations'
import ModalConfirmRejectInvitations from 'screens/Labs/AddLab/components/ModalConfirmRejectInvitations'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {getImageUrlById, getSalutations} from 'utils/ConstFunctions'
import GetInviteButtonDetails from 'screens/Labs/LabList/components/GetInviteButtonDetails'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

const TableContainerForCustomers = ({
  search,
  pageNumber,
  handleOnSearch,
  sendInvite,
  activeTab,
}: {
  search: string
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
  sendInvite: (invitation: Invitation) => void
  activeTab: keyof typeof customerFilterConstants
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()

  // use the practices slice (desktop & mobile stay in sync)
  const {dataPracticeList, loadingPracticeList} = useSelector((state: RootState) => state.practices)
  const data: Invitation[] = dataPracticeList?.doctor_invitation_details_list ?? []
  const totalCustomers = dataPracticeList?.pagination?.total_patients ?? 0

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
          const full_name = getSalutations(salutation) + first_name + ' ' + last_name
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
                    showLoading
                  />
                ) : (
                  <DefaultImage letter={first_name?.charAt(0)} />
                )}
                <span className='text-sm font-semibold text-black cursor-pointer'>{full_name}</span>
                {row.original.admin && (
                  <Tag value='ADMIN' className='text-textColor bg-lightGray text-xs' />
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
            <div className='flex flex-col text-sm font-medium text-black'>
              {row.original.email?.toLocaleLowerCase()}
            </div>
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
          const contact = country_code + ' ' + mobile_no
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
      ...(activeTab === practiceFilterConstants.PENDING
        ? [
            {
              id: 'status',
              header: () => (
                <RenderTableHeader
                  className='w-full font-medium text-xs'
                  header={
                    <div className='flex justify-between items-center w-full'>
                      <p>INVITE</p>
                    </div>
                  }
                />
              ),
              cell: ({row}: {row: Row<Invitation>}) => (
                <RenderCell>
                  <div className='text-sm font-medium break-all'>
                    <GetInviteButtonDetails lab={row.original} sendInvite={sendInvite} />
                  </div>
                </RenderCell>
              ),
              size: 170,
            } as ColumnDef<Invitation>,
          ]
        : []),
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
          <When isTrue={!row.original.admin}>
            <button
              data-edit-customer
              onClick={() => {
                dispatchAction(setDataEditCustomer(row.original))
                const queryParams = new URLSearchParams({edit: 'true'}).toString()
                navigate(`/customers-add/${row.original.invitation_id}?${queryParams}`)
              }}
              className='flex gap-2 items-center'
            >
              <PencilIcon />
              <div className='text-sm text-textColor font-medium'>Edit</div>
            </button>
          </When>
        ),
        size: 50,
      },
    ],
    [activeTab, dispatchAction, navigate]
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const handleSortingChange = (updater: any) => {
    setSorting((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }

  const tableOptions = useMemo(
    () => ({
      columns,
      data: Array.isArray(data) ? data : [],
      state: {
        sorting,
        columnVisibility: {
          last_invitation_at: activeTab === practiceFilterConstants.PENDING,
          total_patients: activeTab !== practiceFilterConstants.PENDING,
        },
      },
      onSortingChange: handleSortingChange,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getCoreRowModel: getCoreRowModel(),
      defaultColumn: {size: 150, minSize: 50, enableSorting: true},
    }),
    [columns, data, sorting, activeTab]
  )

  const table = useReactTable(tableOptions)

  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-10rem)]'>
      <ModalConfirmAcceptInvitations />
      <ModalConfirmRejectInvitations />
      <Spin indicator={<Spinner loading />} spinning={loadingPracticeList}>
        <div className='w-full h-full border border-mediumGray rounded-lg overflow-x-auto'>
          <table className='table-auto w-full curved-table h-full min-w-[720px]'>
            <thead className='bg-mediumGray'>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
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
                    <NoCustomerFound
                      title={hasValue(search) ? 'No results found' : 'No customers added yet'}
                    />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className='border-b border-lightgray text-black text-base group cursor-pointer'
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      // match the button data attribute we use above
                      if (target.closest('button[data-edit-customer]')) return
                      if (row.original.status === 'ACCEPTED') {
                        navigate(`/practice-profile/${row.original.profile_id}`, {
                          state: row.original,
                        })
                      }
                    }}
                  >
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
                <td colSpan={table.getHeaderGroups()[0]?.headers.length} className='text-center'>
                  <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                    <p className='text-textColor text-sm font-medium'>
                      {Math.min((pageNumber - 1) * 10 + 1, totalCustomers)}-
                      {Math.min(pageNumber * 10, totalCustomers)} from {totalCustomers}
                    </p>
                    <Pagination
                      showSizeChanger={false}
                      current={pageNumber}
                      pageSize={10}
                      onChange={(page) => handleOnSearch({page})}
                      total={totalCustomers}
                    />
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

export default TableContainerForCustomers
