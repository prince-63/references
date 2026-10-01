import HeaderTitle from 'components/header/HeaderTitle'
import Page from 'components/page/Page'
import React, {useContext, useEffect, useState} from 'react'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import UnprocessedListFilter from './components/UnprocessedListFilter'
import UnprocessedListSort from './components/UnprocessedListSort'
import TableContainerForUnprocessedOrders from './components/TableContainerForUnprocessedOrders'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {getUnprocessedOrderDetailsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import useActiveProfile from '@hooks/useActiveProfile'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import When from 'components/when/When'
import {getActiveCustomersList} from 'redux/Slices/AppSlice/Customers/customers.slice'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

type CaseType = 'ACTIVE_PLUS_REFINEMENT' | 'ARCHIVED'

const UnprocessedOrders = () => {
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [caseType, setCaseType] = useState<CaseType>('ACTIVE_PLUS_REFINEMENT')

  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {activeProfile} = useActiveProfile()
  const role = (activeProfile?.roles ?? []).map((role) => role.name)
  const {orderUnprocessedFilters} = useSelector((state: RootState) => state.orders)
  const {isOrganization} = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const {loadingUnprocessedOrderList, loadingActiveUsers} = useSelector(
    (state: RootState) => state.orders
  )

  // Fetch active customers
  useEffect(() => {
    if (userId && organizationId && profileId) {
      dispatchAction(
        getActiveCustomersList({
          payload: {
            doctor_id: String(userId),
            invitation_status: 'ACCEPTED',
            sort_order: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST,
            page_number: 0,
            page_size: 0,
            search: null,
          },
          roles: activeProfile.roles,
        })
      )
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    handleSearch({})
  }, [pageNumber, caseType]) // eslint-disable-line

  const handleSearch = ({
    search_term = null,
    customer_id = orderUnprocessedFilters.selected_customer,
    sort_option = 'NEWEST_TO_OLDEST',
    due_by_filter = orderUnprocessedFilters.filterDueBy,
    case_type = caseType,
  }: {
    search_term?: string | null
    customer_id?: string | null
    sort_option?: 'NEWEST_TO_OLDEST' | 'OLDEST_TO_NEWEST'
    due_by_filter?: null | string
    case_type?: CaseType
  }) => {
    if (!userId) throw new Error('User ID not found')
    dispatchAction(
      getUnprocessedOrderDetailsList({
        page: pageNumber - 1,
        customer_id,
        search_term,
        sort_option,
        due_by_filter,
        roles: role,
        case_type,
      })
    )
  }

  const selectCaseTab = (next: CaseType) => {
    if (next === caseType) return
    setCaseType(next)
    setCurrentPageNumber(1)
  }

  const isActive = caseType === 'ACTIVE_PLUS_REFINEMENT'
  const isArchived = caseType === 'ARCHIVED'

  return (
    <Page
      loading={loadingUnprocessedOrderList && loadingActiveUsers}
      containerClassName=' pb-[70px] md:pb-0'
    >
      <HeaderTitle
        title='Unprocessed aligners'
        subTitle='View aligner batches pending manufacturing.'
      />

      <div className='flex flex-col gap-4 md:gap-3'>
        <div className='mt-1'>
          <div
            className={[
              'inline-flex md:gap-6 items-center',
              'w-full md:w-auto overflow-x-auto md:overflow-visible no-scrollbar',
              'gap-2 pr-1',
            ].join(' ')}
          >
            <button
              type='button'
              className={[
                'px-3 py-2 rounded-xl text-sm md:text-base font-semibold transition-colors whitespace-nowrap',
                isActive ? 'bg-primarySupport text-primaryColor' : 'text-black/70 hover:text-black',
              ].join(' ')}
              onClick={() => selectCaseTab('ACTIVE_PLUS_REFINEMENT')}
              aria-pressed={isActive}
            >
              ACTIVE
            </button>

            <button
              type='button'
              className={[
                'px-3 py-2 rounded-xl text-sm md:text-base font-semibold transition-colors whitespace-nowrap',
                isArchived
                  ? 'bg-primarySupport text-primaryColor'
                  : 'text-black/70 hover:text-black',
              ].join(' ')}
              onClick={() => selectCaseTab('ARCHIVED')}
              aria-pressed={isArchived}
            >
              ARCHIVED CASES
            </button>
          </div>
        </div>

        {/* Search + filters — desktop row; mobile stacked */}
        <div className='flex flex-col md:flex-row gap-3'>
          <PracticeSearchInput
            placeholder='Search'
            className='w-[320px] flex-none'
            handleSearch={(value) => {
              // reset to first page for new searches
              setCurrentPageNumber(1)
              handleSearch({search_term: value})
            }}
          />

          <div className='w-full flex flex-col md:flex-row gap-3'>
            <When isTrue={isOrganization}>
              <div className='w-full md:w-auto'>
                <UnprocessedListFilter
                  handleFilterOrder={(p) => {
                    setCurrentPageNumber(1)
                    handleSearch(p as any)
                  }}
                />
              </div>
            </When>

            <div className='w-full md:w-auto'>
              <UnprocessedListSort
                handleSortOrder={(p) => {
                  setCurrentPageNumber(1)
                  handleSearch(p as any)
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='w-full'>
          <TableContainerForUnprocessedOrders
            pageNumber={pageNumber}
            setCurrentPageNumber={setCurrentPageNumber}
            handleSearch={handleSearch}
            caseType={caseType}
          />
        </div>
      </div>

      {/* tiny utility to hide scrollbars on mobile tab row */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </Page>
  )
}

export default UnprocessedOrders
