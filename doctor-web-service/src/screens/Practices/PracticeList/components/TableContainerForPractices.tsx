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
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import {Pagination, Spin} from 'antd'
import {useNavigate} from 'react-router-dom'
import Spinner from 'components/spinner/Spinner'
import {setDataEditPractice} from 'redux/Slices/AppSlice/Practices/practices.slice'
import moment from 'moment'
import PencilIcon from 'assets/icons/PencilIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import NoPracticeFound from './NoPracticeFound'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import InfoIcon from 'assets/icons/InfoIcon'
import DropDownOutline from 'assets/icons/DropDownOutline'
import getColorPalette from 'utils/getColorPalette'
import clsx from 'clsx'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import When from 'components/when/When'
import dayjs from 'dayjs'
import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import copy from 'copy-to-clipboard'
import Tag from 'components/tags/Tag'
import getBrandConfig from 'utils/getBrandConfig'
import {getImageUrlById, getSalutations} from 'utils/ConstFunctions'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

const TableContainerForPractices = ({
  pageNumber,
  handleOnSearch,
  sendInvite,
  activeTab,
  isAccessible,
}: {
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
  sendInvite: (invitation: Invitation) => void
  activeTab: keyof typeof practiceFilterConstants
  isAccessible: boolean
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {dataPracticeList, loadingPracticeList} = useSelector((state: RootState) => state.practices)
  const data = dataPracticeList.doctor_invitation_details_list
  const totalPractices = dataPracticeList?.pagination?.total_patients ?? 0
  const {loadingAddingEditPractice} = useSelector((state: RootState) => state.practices)

  const columns = useMemo<ColumnDef<Invitation>[]>(
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
          const full_name = getSalutations(salutation) + ' ' + first_name + ' ' + last_name
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
                <span className='text-sm font-semibold text-black cursor-pointer'>{full_name}</span>
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
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>EMAIL</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex flex-col text-sm font-medium text-black'>
                {row.original.email}
              </div>
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
                  <p>MOBILE NUMBER</p>
                </div>
              ),
            }}
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
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>ADDED ON</p>
                </div>
              ),
            }}
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
        id: 'last_invitation_at',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>INVITE</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          function getHoursDifference(dateInSec: number): number {
            const now = dayjs() // Current time
            const past = dayjs(dateInSec) // Convert timestamp to Day.js object
            return now.diff(past, 'hour') // Get the difference in hours
          }
          const getButton = (last_invitation_at: string) => {
            if (last_invitation_at === null) {
              return (
                <button
                  className='flex gap-2 items-center text-primaryColor'
                  disabled={loadingAddingEditPractice}
                  onClick={() => sendInvite(row.original)}
                >
                  <div>Send Invite</div>
                  <div className='-rotate-90'>
                    <DropDownOutline color={getColorPalette().primaryColor} />
                  </div>
                </button>
              )
            } else {
              const hoursSinceLastInvite = getHoursDifference(
                new Date(last_invitation_at).getTime()
              )

              if (hoursSinceLastInvite < 24) {
                const remainingHours = 24 - hoursSinceLastInvite
                return (
                  <div className='flex items-center  gap-2'>
                    <button className='flex gap-1 items-center text-textColor' disabled>
                      <InfoIcon width='16' height='16' />
                      <div> Resend Invite in {remainingHours} h</div>
                    </button>
                    <CopyLinkButton code={row.original.invitation_code} />
                  </div>
                )
              } else {
                return (
                  <div className='flex items-center  gap-2'>
                    <button
                      className='flex gap-2 items-center text-primaryColor'
                      onClick={() => sendInvite(row.original)}
                      disabled={loadingAddingEditPractice}
                    >
                      <div>Resend invite</div>
                      <div className='-rotate-90'>
                        <DropDownOutline color={getColorPalette().primaryColor} />
                      </div>
                    </button>
                    <CopyLinkButton code={row.original.invitation_code} />
                  </div>
                )
              }
            }
          }

          return (
            <RenderCell>
              <div className='text-sm font-medium break-all'>
                {getButton(row.original?.last_invitation_at)}
              </div>
            </RenderCell>
          )
        },
        size: 150,
      },

      {
        id: 'invited_at',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-xs',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>ACTIONS</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <When isTrue={!row.original.admin}>
              <button
                data-edit-practice
                onClick={() => {
                  if (!isAccessible) return
                  dispatchAction(setDataEditPractice(row.original))
                  const queryParams = new URLSearchParams({
                    edit: 'true',
                  }).toString()
                  navigate(`/practices-add/${row.original.invitation_id}?${queryParams}`)
                }}
                className='flex gap-2 items-center'
              >
                <PencilIcon />
                <div className='text-sm text-textColor font-medium'>Edit</div>
              </button>
            </When>
          )
        },
        size: 50,
      },
    ],
    [data, activeTab]
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const handleSortingChange = (updater: any) => {
    setSorting((prevSorting) => {
      const newSorting = typeof updater === 'function' ? updater(prevSorting) : updater
      return newSorting
    })
  }

  const tableOptions = useMemo(() => {
    return {
      columns: columns,
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
      defaultColumn: {
        size: 150,
        minSize: 50,
        enableSorting: true,
      },
    }
  }, [columns, data, sorting, activeTab])

  const table = useReactTable(tableOptions)

  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-10rem)]'>
      <Spin indicator={<Spinner loading />} spinning={loadingPracticeList}>
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

            {/* Empty State */}
            {table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0]?.headers.length}
                    className='text-center py-4'
                  >
                    <NoPracticeFound />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const className = cn(
                    `border-b border-lightgray text-black text-base group cursor-pointer`
                  )
                  return (
                    <tr
                      key={row.id}
                      className={className}
                      onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
                        const target = e.target as HTMLElement
                        if (target.closest('button[data-edit-practice]')) {
                          return
                        }

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
                  )
                })}
              </tbody>
            )}

            {/* Footer */}
            <tfoot className='border-t border-mediumGray'>
              <tr>
                <td colSpan={table.getHeaderGroups()[0]?.headers.length} className='text-center'>
                  <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                    <p className='text-textColor text-sm font-medium'>
                      {Math.min((pageNumber - 1) * 10 + 1, totalPractices)}-
                      {Math.min(pageNumber * 10, totalPractices)} from {totalPractices}
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
                        total={totalPractices}
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

export default TableContainerForPractices

export const CopyLinkButton = ({code}: {code: string}) => {
  return (
    <button
      onClick={() => {
        SuccessToast('Link copied!')
        copy(getBrandConfig().inviteLink + code + '/connect')
      }}
    >
      <LinkSimpleIcon width='22' height='22' color={getColorPalette().primaryColor} />
    </button>
  )
}
