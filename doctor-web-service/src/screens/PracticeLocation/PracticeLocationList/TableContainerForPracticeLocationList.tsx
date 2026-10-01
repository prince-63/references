import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {Column, useGlobalFilter, usePagination, useSortBy, useTable} from 'react-table'
import BoxBadge from '../../../components/atom/Box/BoxBadge'
import {AuthContext} from '../../../context/AuthContext'
import {
  SVG_CLINIC_GRAY,
  SVG_Gray_PENCIL,
  SVG_INFO_BIG_DOT,
  SVG_PLUS_WHITE,
} from '../../../utils/SvgConstants'
import CommonSVG from '../../../components/atom/SVG/CommonSVG'

import AddPracticeLocation from '../AddPracticeLocation'
import ModalSuccess from '../../../components/modal/Alert/ModalSuccess'
import InputSearch from '../../../components/atom/Inputs/InputSearch'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {useSearchParams} from 'react-router-dom'
import {identifyUser} from 'utils/ConstFunctions'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
import PracticeLocationMobileCard from '../components/PracticeLocationMobileCard'
import {PracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/editPracticeLocationSlice'
import Search from 'components/PatientList/Search'
import {useMediaQuery} from 'react-responsive'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'
interface Props {
  changeStatus: (row: any, e: any) => void
  setActiveRowOption: (x: number | null) => void
  activeRowOption: number | null
  openEditPracticeLocation: (clinic: any) => void
  callSetPrimary: (clinic: any) => void
  data: any[]
  success: boolean
  successTitle: string
  setSuccessTitle: (successTitle: string) => void
  setSuccess: (success: boolean) => void
  editPracticeLocationStatusModel: boolean
  setAddPracticeLocationStatusModal: (success: boolean) => void
  addPracticeLocationStatusModal: boolean
  clinicData: any
  setEditPracticeLocationStatusModel: (success: boolean) => void
}
const TableContainerForPracticeLocationList: React.FC<Props> = (props) => {
  const {demoModeStatus} = useContext(AuthContext)
  const {isStarterPlanUser} = useAllUserPlan()
  const dropdownRef: any = useRef(null)
  const [isNew, setIsNew] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState('')
  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})
  const {permissionChecks} = useFeatureAccess()
  const practiceLocation = permissionChecks?.practiceLocation
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveRowOption(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const {
    changeStatus,
    setActiveRowOption,
    activeRowOption,
    openEditPracticeLocation,
    callSetPrimary,
    success,
    successTitle,
    setSuccessTitle,
    data,
    setSuccess,
    clinicData,
    addPracticeLocationStatusModal,
    setEditPracticeLocationStatusModel,
    setAddPracticeLocationStatusModal,
  } = props
  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: 'practice_location_id',
      },
      {
        Header: 'Clinic name',
        accessor: 'practice_location_name',
        Cell: ({row}: any) => (
          <div className='flex justify-start items-start pe-2 text-sm font-medium min-w-[150px] max-h-[100px]'>
            <div>
              {row?.original?.practice_location_name} <br />
              {row?.original?.practice_location_type === 'Primary' ? (
                <div className='m-1'>
                  <BoxBadge simple={true} title='Primary' className='text-xs font-bold' />
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        ),
        width: '22%',
      },
      {
        Header: 'Address',
        accessor: 'address',
        Cell: ({row}: any) => (
          <div className='flex justify-start items-center pe-4 text-sm text-textColor min-w-[150px] '>
            <p> {row?.original?.address}</p>
          </div>
        ),
        width: '27%',
      },
      {
        Header: 'Mobile No.',
        accessor: 'mobile_number',
        Cell: ({row}: any) => (
          <div className=' flex justify-start items-center text-sm text-textColor min-w-[100px]'>
            <p>{hasValue(row?.original?.mobile_number) ? row?.original?.mobile_number : '--'}</p>
          </div>
        ),
        width: '15%',
      },
      {
        Header: 'City',
        accessor: 'city',
        Cell: ({row}: any) => (
          <div className='flex justify-start items-center text-textColor text-sm'>
            <p> {hasValue(row?.original?.city) ? row?.original?.city : '--'}</p>
          </div>
        ),
        width: '13%',
      },
      {
        Header: 'Country',
        accessor: 'country',
        Cell: ({row}: any) => (
          <div className=' flex justify-start items-center text-textColor text-sm min-w-[80px]'>
            <p>{hasValue(row?.original?.country) ? row?.original?.country : '--'}</p>
          </div>
        ),
        width: '10%',
      },
      {
        Header: 'Status',
        accessor: 'active',
        Cell: ({row}: any) => (
          <select
            className={
              row.original.active
                ? 'bg-tertiarySupport text-tertiaryColor text-sm font-semibold rounded px-2 py-1 outline-none w-fit'
                : 'bg-redSupport text-red text-sm font-semibold rounded px-2 py-1 outline-none w-fit'
            }
            disabled={row?.original?.practice_location_type === 'Primary'}
            onChange={(e) => {
              identifyUser()
              changeStatus(row.original, e.target.value)
            }}
          >
            <option className='hidden'>{row.original.active ? 'Active' : 'Inactive'}</option>
            <option value={1}>{'Active'}</option>
            <option value={0}>{'Inactive'}</option>
          </select>
        ),
        width: '10%',
      },
      {
        Header: () => <div className='header-cell text-mediumGray mt-4 '>⯆</div>,
        accessor: 'practice_location_type',
        Cell: ({row}: any) => {
          return (
            <div
              className={`w-full relative grid justify-items-center ${
                demoModeStatus ? 'pointer-events-none' : ''
              }`}
              onClick={() => setActiveRowOption(row.index)}
            >
              <button
                type='button'
                className='rounded justify-start items-center gap-2 inline-flex'
              >
                <CommonSVG svg={SVG_INFO_BIG_DOT} width='18' height='32' />
              </button>
              {activeRowOption === row.index && (
                <div
                  ref={dropdownRef}
                  className='origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-10'
                >
                  <div className='pt-1'>
                    <When
                      isTrue={
                        practiceLocation?.practiceLocationDetails?.isEditable || isStarterPlanUser
                      }
                    >
                      <div className='flex items-center gap-4 m-2  cursor-pointer'>
                        <div className='ml-1'>
                          <CommonSVG svg={SVG_Gray_PENCIL} width='18' height='18' />
                        </div>
                        <div
                          className='w-24 text-black text-sm font-medium leading-normal'
                          onClick={() => {
                            identifyUser()
                            openEditPracticeLocation(row.original)
                            setAddPracticeLocationStatusModal(true)
                            setIsNew(false)
                          }}
                        >
                          Edit details
                        </div>
                      </div>
                    </When>
                    {row.original.active && (
                      <When
                        isTrue={practiceLocation?.changeStatus?.isEditable || isStarterPlanUser}
                      >
                        {row?.original?.practice_location_type === 'Secondary' ? (
                          <>
                            <hr />
                            <div
                              className='flex items-center gap-2 m-2 cursor-pointer'
                              onClick={() => {
                                identifyUser()
                                callSetPrimary(row?.original)
                              }}
                            >
                              <CommonSVG svg={SVG_CLINIC_GRAY} width='33' height='33' />
                              <div className='w-24 text-black text-sm font-medium leading-normal'>
                                Set as primary
                              </div>
                            </div>
                          </>
                        ) : (
                          ''
                        )}
                      </When>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        },
      },
    ],
    [activeRowOption]
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // @ts-ignore
    setGlobalFilter,
    // @ts-ignore
    page,
    // @ts-ignore
    pageOptions,
    // @ts-ignore
    // @ts-ignore
    nextPage,
    // @ts-ignore
    previousPage,
    // @ts-ignore
    prepareRow,
    // @ts-ignore
    gotoPage,
    // @ts-ignore
    state: {pageIndex, pageSize, globalFilter},
  } = useTable(
    {
      // @ts-ignore
      columns,
      data,

      initialState: {
        // @ts-ignore
        pageIndex: 0,
        pageSize: 10,
        hiddenColumns: ['practice_location_id', 'isPrimary'],
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  const pageNumbers = Array.from({length: pageOptions.length}, (_, index) => index + 1)

  useEffect(() => {
    if (successTitle.length > 0) {
      setSuccess(true)
      setTimeout(() => {
        setSuccessTitle('')
      }, 3000)
    }
  }, [successTitle])

  const [searchParams] = useSearchParams()

  useEffect(() => {
    setGlobalFilter(searchParams.get('search') || '')
  }, [])

  const callFilterPracticeLocationList = (searchedString: string) => {
    setSearchValue(searchedString)
    setGlobalFilter(searchedString)
  }

  const callAddPracticeLocation = () => {
    setIsNew(true)
    setAddPracticeLocationStatusModal(true)
  }

  let startItemIndex = 0
  let endItemIndex = 0

  if (data?.length > 0) {
    startItemIndex = pageIndex * pageSize
    endItemIndex = Math.min((pageIndex + 1) * pageSize, data?.length)
  }
  const [paginatedData, setPaginatedData] = useState(data?.slice(startItemIndex, endItemIndex))

  useEffect(() => {
    if (globalFilter?.length > 0 && isTabletAndBelow) {
      setPaginatedData(searchFilter(data, globalFilter))
    } else {
      if (globalFilter === '') {
        setPaginatedData(data?.slice(startItemIndex, endItemIndex))
      }
    }
  }, [globalFilter])

  const searchFilter = (data: PracticeLocation[], searchTerm: string): PracticeLocation[] => {
    if (!searchTerm) return data

    const lowercasedSearchTerm = searchTerm

    return data.filter(
      (item) =>
        item.practice_location_name.includes(lowercasedSearchTerm) ||
        item.mobile_number.includes(lowercasedSearchTerm) ||
        item.address.includes(lowercasedSearchTerm)
    )
  }

  return (
    <div className=''>
      {success && <ModalSuccess setIsSuccessModelOpen={setSuccess} title={successTitle} />}
      <When isTrue={addPracticeLocationStatusModal}>
        <AddPracticeLocation
          setIsAddPracticeLocationModelOpen={setAddPracticeLocationStatusModal}
          clinicData={clinicData}
          setIsEditPracticeLocationModelOpen={setEditPracticeLocationStatusModel}
          isNew={isNew}
          setSuccessTitle={setSuccessTitle}
          setPracticeLocationName={() => {}}
        />
      </When>

      <div className='flex flex-col  md:flex-row justify-between md:items-end mt-2 gap-3'>
        <div>
          <div className='md:w-96 text-black text-2xl font-semibold'>
            Practice Locations (Clinics)
          </div>
          <div className='md:w-96 text-textColor text-base font-normal'>
            Manage all your practice locations here
          </div>
        </div>
        <div>
          <When isTrue={practiceLocation?.practiceLocationDetails?.isAddable || isStarterPlanUser}>
            <button
              className=' w-full  md:w-fit px-3.5 py-2.5 bg-primaryColor rounded-lg justify-center items-center gap-2 inline-flex'
              disabled={demoModeStatus ? true : false}
              onClick={() => {
                identifyUser()
                setAddPracticeLocationStatusModal(true)
                setIsNew(true)
              }}
            >
              <CommonSVG svg={SVG_PLUS_WHITE} width='16' height='16' />
              <div className='text-white text-sm font-semibold'>Add practice location</div>
            </button>
          </When>
        </div>
      </div>
      <div
        className={`flex flex-col md:flex-row justify-between py-6 ${
          demoModeStatus ? 'pointer-events-none' : ''
        }`}
      >
        <div className='w-[390px] text-black md:text-xl text-lg font-semibold'>
          Your locations ({data.length})
        </div>
        <div className='md:hidden w-full  '>
          <Search globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} max={30} />
        </div>
        <div className='hidden md:block'>
          <InputSearch
            className='md:!w-[200px] h-10 '
            placeholder='Search practice location'
            value={globalFilter || ''}
            onChange={(e: any) => callFilterPracticeLocationList(e.target.value)}
            maxLength={30}
            minLength={2}
          />
        </div>
      </div>
      <When isTrue={data.length === 0}>
        <CommonEmptyState
          image={IMAGE_EMPTY_STATE}
          boxStyle='text-center'
          title='No practice location added'
          titleStyle='text-[20px] font-semibold md:mt-7'
          subTitle='Add your practice location and link your patients to them and sort accordingly'
          subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4'
          buttonText={
            practiceLocation?.practiceLocationDetails?.isAddable || isStarterPlanUser
              ? '+ Add practice location'
              : null
          }
          buttonStyle='mt-[13px] border border-primaryColor text-primaryColor font-semibold px-[85px] md:px-[20px] py-[10px] rounded-[8px] text-[16px]'
          onClick={callAddPracticeLocation}
        />
      </When>

      <When isTrue={data?.length !== 0}>
        <div className='w-full hidden md:block'>
          <table {...getTableProps()} className='table-auto w-full '>
            <thead>
              {headerGroups.map((headerGroup, index: number) => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  key={index}
                  className='border-b-2 border-mediumGray'
                >
                  {headerGroup.headers.map((column: any, index: number) => (
                    <th
                      className='text-start text-black text-sm font-medium py-2'
                      key={index}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{width: column.width}}
                    >
                      {column.render('Header')}
                      <span className='ml-2'>
                        {column.isSorted && (column.isSortedDesc ? '⯆' : '⯅')}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className=''>
                    <center className='font-semibold mt-2'>No record present</center>
                  </td>
                </tr>
              ) : (
                page.map((row: any, index: number) => {
                  prepareRow(row)
                  return (
                    <tr
                      {...row.getRowProps()}
                      key={index}
                      className='border-b border-mediumGray text-black text-base '
                    >
                      {row.cells.map((cell: any, index: number) => (
                        <td {...cell.getCellProps()} key={index} className=''>
                          <div className='flex py-4'>{cell.render('Cell')}</div>
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className='md:hidden block'>
          {paginatedData &&
            paginatedData.map((listItem: PracticeLocation) => {
              return (
                <div key={listItem.practice_location_id}>
                  <PracticeLocationMobileCard
                    changeStatus={changeStatus}
                    practiceLocationObject={listItem}
                    setIsNew={setIsNew}
                    setAddPracticeLocationStatusModal={setAddPracticeLocationStatusModal}
                    openEditPracticeLocation={openEditPracticeLocation}
                    callSetPrimary={callSetPrimary}
                  />
                </div>
              )
            })}
        </div>
        <When isTrue={searchValue.length === 0}>
          <div className='flex m-5 justify-between'>
            <div className='w-96 text-textColor text-sm font-medium leading-tight tracking-tight'>
              Showing {startItemIndex}-{endItemIndex} from {data.length}
            </div>

            <div className='flex gap-1'>
              <button
                className='w-8 h-8 p-1.5 rounded-lg text-center bg-primaryColor text-white text-sm font-semibold leading-tight tracking-tight'
                onClick={previousPage}
              >
                {'<'}
              </button>
              {pageNumbers.map((page, index) => (
                <button
                  key={page}
                  className={`${
                    pageIndex + 1 === page
                      ? 'className="w-8 h-8 p-1.5 rounded-lg text-center bg-primaryColor text-white text-sm font-semibold leading-tight tracking-tight"'
                      : 'className="w-8 h-8 p-1.5 rounded-lg text-center bg-primarySupport text-primaryColor text-sm font-semibold leading-tight tracking-tight"'
                  } px-3`}
                  onClick={() => gotoPage(index)}
                >
                  {page}
                </button>
              ))}
              <button
                className='w-8 h-8 p-1.5 rounded-lg text-center bg-primaryColor text-white text-sm font-semibold leading-tight tracking-tight'
                onClick={nextPage}
              >
                {'>'}
              </button>
            </div>
          </div>
        </When>
      </When>
    </div>
  )
}

export default TableContainerForPracticeLocationList
