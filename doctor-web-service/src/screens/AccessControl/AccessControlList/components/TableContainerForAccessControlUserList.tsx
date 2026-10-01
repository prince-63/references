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
import {useNavigate} from 'react-router-dom'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {Pagination, Popover, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import {Image} from 'assets/images/Images/Image'
import hasValue from 'utils/hasValue'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import clsx from 'clsx'
import When from 'components/when/When'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import copy from 'copy-to-clipboard'
import getBrandConfig from 'utils/getBrandConfig'
import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import PencilIcon from 'assets/icons/PencilIcon'
import DeactivateUserIcon from 'assets/icons/DeactivateUserIcon'
import SettingIcon from 'assets/icons/SettingIcon'
import {setDataAddingEditUser} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {RowDataUserList} from '../types/accessControlList.types'
import NoCustomerFound from 'screens/Customers/CustomerList/components/NoCustomerFound'
import {getImageUrlById, getRole, getSalutations} from 'utils/ConstFunctions'
import DeactivateUserLink from './DeactivateUserLink'

const TableContainerForAccessControlUserList = ({
  pageNumber,
  handleOnSearch,
}: {
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {userList, loadingList} = useSelector((state: RootState) => state.accessControl)
  const data = userList?.users || []
  const pageSize = userList?.pagination_details?.page_size ?? 10
  const totalPractices = userList?.pagination_details?.total_patients
  const [openModal, setOpenModal] = useState(false)
  const [id, setId] = useState(0)
  const columns = useMemo<ColumnDef<RowDataUserList>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'first_name',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>NAME</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const salutation = row.original.salutation ?? ''
          const first_name = row.original.first_name
          const last_name = row.original.last_name ?? ''
          const full_name = getSalutations(salutation) + first_name + ' ' + last_name
          const profile_url = row?.original?.profile_image_id
            ? getImageUrlById(row?.original?.profile_image_id)
            : row.original?.profile_image_url

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
                <div className='text-sm font-medium text-black'>{full_name}</div>
              </div>
            </RenderCell>
          )
        },
        size: 200,
      },
      {
        id: 'email',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-normal text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>CONTACT</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const mobile =
            row.original.mobile_number != null && row.original.mobile_number !== ''
              ? `${row.original.country_code ?? ''} ${row.original.mobile_number}`
              : '-'
          return (
            <RenderCell>
              <div className='flex flex-col text-sm font-medium text-black'>
                {row.original.email}
              </div>
              <div className='flex flex-col text-sm font-normal text-textColor'>{mobile}</div>
            </RenderCell>
          )
        },
        size: 150,
      },
      {
        id: 'mobile_no',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>ROLE</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const role = row.original.sub_role_name

          return (
            <RenderCell>
              <div
                className={clsx(
                  'text-sm text-textColor bg-[#F5F5F5] font-semibold p-1 rounded-lg w-fit  px-2'
                )}
              >
                {getRole(role)}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },

      {
        id: 'status',
        accessorKey: 'status',
        enableSorting: true,
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>STATUS</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return <RenderCell>{getStatus(row.original.invitation_status)}</RenderCell>
        },
        size: 100,
      },
      {
        id: 'invited_at',
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
          const isNotSuperAdmin = row.original.sub_role_name !== 'SUPER_ADMIN'
          return (
            <When isTrue={row.original.invitation_status !== 'DEACTIVATED' && isNotSuperAdmin}>
              <Popover
                content={
                  <div className='flex flex-col gap-2 p-3'>
                    <When isTrue={row?.original?.invitation_status !== 'ACCEPTED'}>
                      <button
                        className='flex gap-3 items-center'
                        onClick={() => {
                          SuccessToast('Link copied!')
                          copy(getBrandConfig().inviteLink + row.original.invite_code + '/connect')
                        }}
                      >
                        <LinkSimpleIcon />
                        <div>Copy link</div>
                      </button>
                    </When>
                    <button
                      className='flex gap-3 items-center'
                      onClick={() => {
                        dispatchAction(setDataAddingEditUser(row.original))
                        const queryParams = new URLSearchParams({
                          edit: 'true',
                        }).toString()
                        navigate(`/add-access-control-user?${queryParams}`)
                      }}
                    >
                      <PencilIcon width='24' height='24' />
                      <div>Edit</div>
                    </button>

                    <button
                      className='flex gap-3 items-center text-red '
                      onClick={() => {
                        dispatchAction(setDataAddingEditUser(row.original))
                        setId(row.original.invitation_id)
                        setOpenModal(true)
                      }}
                    >
                      <DeactivateUserIcon />
                      <div>Deactivate</div>
                    </button>
                  </div>
                }
                overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree'}}
                placement='left'
                trigger={['click']}
                className='transition ease-in-out duration-200'
              >
                <button
                  className={clsx(
                    'md:w-fit w-full rounded-lg flex justify-center items-center  px-2 py-2  text-textColor'
                  )}
                  type='button'
                >
                  <SettingIcon color={'#666666'} />
                </button>
              </Popover>
            </When>
          )
        },
        size: 50,
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
    defaultColumn: {
      size: 150,
      minSize: 50,
    },
  })
  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-10rem)]'>
      <DeactivateUserLink openModal={openModal} setOpenModal={setOpenModal} id={id} />
      <Spin indicator={<Spinner loading />} spinning={loadingList}>
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
                    <NoCustomerFound title={'No results found'} />
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
                      {totalPractices === 0
                        ? '0-0'
                        : `${Math.min((pageNumber - 1) * pageSize + 1, totalPractices)}-${Math.min(
                            pageNumber * pageSize,
                            totalPractices
                          )}`}{' '}
                      from {totalPractices}
                    </p>
                    <div className='md:hidden block'>
                      <Pagination
                        showSizeChanger={false}
                        current={pageNumber}
                        pageSize={pageSize}
                        showLessItems
                        onChange={(page) => {
                          handleOnSearch({
                            page,
                          })
                        }}
                        total={totalPractices}
                      />
                    </div>
                    <div className='hidden md:block'>
                      <Pagination
                        showSizeChanger={false}
                        current={pageNumber}
                        pageSize={pageSize}
                        onChange={(page) => {
                          handleOnSearch({
                            page,
                          })
                        }}
                        total={totalPractices}
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

export default TableContainerForAccessControlUserList

const getStatus = (status: string) => {
  let text = 'Invited'
  let dotClass = 'bg-[#666]'

  switch (status) {
    case 'ACCEPTED':
      text = 'Active'
      dotClass = 'bg-[#00B383]'
      break
    case 'DEACTIVATED':
      text = 'Inactive'
      dotClass = 'bg-[#F45045]'
      break
    case 'PENDING':
      text = 'Invited'
      dotClass = 'bg-[#666]'
      break
  }

  return (
    <div className='flex items-center gap-1 text-sm font-medium break-all'>
      <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
      <div className={'text-textColor'}>{text}</div>
    </div>
  )
}
