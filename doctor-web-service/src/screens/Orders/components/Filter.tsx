import React, {useMemo, useCallback} from 'react'
import {Divider, Popover} from 'antd'
import clsx from 'clsx'
import {useSelector} from 'react-redux'
import {useLocation} from 'react-router-dom'

import FunnelIcon from 'assets/icons/FunnelIcon'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'
import When from 'components/when/When'
import {RootState} from 'redux/store'
import {setOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {ordersPageFilterBar} from '../orders.types'
import orderNewFilterConstants from '@constants/orderNewFilter.constants'
import orderFilterConstants from '@constants/orderFilter.constants'
import ordersListFilterByAssignedUserOptions from '@staticData/ordersListFilterByAssignedUserOptions'
import ordersListFilterByOrderDueOptions from '@staticData/ordersListFilterByOrderDueOptions'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface FilterProps {
  filter?: ordersPageFilterBar
  setCurrentPageNumber: (page: number) => void
}

const ALIGNER_ORDER_OPTIONS = [
  {label: 'All ', value: orderNewFilterConstants.ALL},
  {label: 'Draft ', value: orderNewFilterConstants.DRAFT},
  {label: 'Ordered ', value: orderNewFilterConstants.ORDERED},
  {label: 'Need more info', value: orderNewFilterConstants.NEED_MORE_INFO},
  {label: 'Plan In Progress ', value: orderNewFilterConstants.IN_PROGRESS},
  {label: 'Plan In Review ', value: orderNewFilterConstants.IN_REVIEW},
  {label: 'Re-Plan', value: orderNewFilterConstants.RE_PLAN},
  {label: 'Plan Approved ', value: orderNewFilterConstants.APPROVED},
  {label: 'Manufacturing Pending', value: orderNewFilterConstants.MANUFACTURE_IN_PENDING},
  {label: 'Manufacturing In Progress', value: orderNewFilterConstants.MANUFACTURE_IN_PROGRESS},
  {label: 'Manufacturing Completed', value: orderNewFilterConstants.MANUFACTURE_IN_COMPLETE},
  {label: 'Transit', value: orderNewFilterConstants.IN_TRANSIT},
  {label: 'Delivered', value: orderNewFilterConstants.DELIVERED},
  {label: 'Completed', value: orderNewFilterConstants.COMPLETED},
  {label: 'Cancelled', value: orderNewFilterConstants.CANCELLED},
] as const

const DEFAULT_ORDER_OPTIONS = [
  {label: 'All ', value: orderFilterConstants.ALL},
  {label: 'Draft ', value: orderFilterConstants.DRAFT},
  {label: 'Ordered ', value: orderFilterConstants.ORDERED},
  {label: 'Need more info', value: orderFilterConstants.NEED_MORE_INFO},
  {label: 'Plan In Progress ', value: orderFilterConstants.IN_PROGRESS},
  {label: 'Plan In Review ', value: orderFilterConstants.IN_REVIEW},
  {label: 'Re-Plan', value: orderFilterConstants.RE_PLAN},
  {label: 'Plan Approved ', value: orderFilterConstants.APPROVED},
  {label: 'Completed', value: orderFilterConstants.COMPLETED},
  {label: 'Cancelled', value: orderFilterConstants.CANCELLED},
] as const

const Filter: React.FC<FilterProps> = ({filter, setCurrentPageNumber}) => {
  const {orderFilters} = useSelector((state: RootState) => state.orders)
  const {dispatchAction} = useDispatchAction()
  const location = useLocation()
  const userRole = useAllUserPlan() // Move hook to top level

  const isOnAlignerOrderPage = useMemo(
    () => location.pathname.split('/').filter(Boolean).pop() === 'aligner-orders',
    [location.pathname]
  )

  const filteredOrdersListOptions = useMemo(() => {
    const {isPractice, isAlignerCompanyOrg} = userRole

    if ((isPractice || isAlignerCompanyOrg) && isOnAlignerOrderPage) {
      return ALIGNER_ORDER_OPTIONS
    }
    return DEFAULT_ORDER_OPTIONS
  }, [userRole, isOnAlignerOrderPage]) // Include userRole in dependencies

  // Memoize filter handlers
  const handleOrderStatusChange = useCallback(
    (value: string) => {
      setCurrentPageNumber(1)
      dispatchAction(setOrderFilters({filterByOrderStatus: value}))
    },
    [setCurrentPageNumber, dispatchAction]
  )

  const handleDueByChange = useCallback(
    (value: string) => {
      setCurrentPageNumber(1)
      dispatchAction(setOrderFilters({filterByDueBy: value}))
    },
    [setCurrentPageNumber, dispatchAction]
  )

  const handleAssignedUserChange = useCallback(
    (value: string) => {
      setCurrentPageNumber(1)
      dispatchAction(setOrderFilters({filterByAssignedUser: value}))
    },
    [setCurrentPageNumber, dispatchAction]
  )

  // Memoize popover content
  const popoverContent = useMemo(
    () => (
      <div className='flex flex-col gap-2 p-4 text-textColor max-h-[75vh] overflow-y-auto'>
        <div className='flex flex-col gap-3 min-w-60 dropdownRadio pr-2'>
          <p className='uppercase font-semibold text-xs'>Filter by Order status</p>
          {filteredOrdersListOptions.map((option) => (
            <FilterOptionSelectDropdown
              key={option.value}
              value={option.value}
              label={option.label}
              onChange={() => handleOrderStatusChange(option.value)}
              checked={option.value === orderFilters.filterByOrderStatus}
            />
          ))}
        </div>

        <When isTrue={(userRole.isDesignLabUser || userRole.isAlignerCompanyOrg) && !filter?.SENT}>
          <Divider className='my-3' />
          <div className='flex flex-col gap-3 min-w-60 dropdownRadio pr-2'>
            <p className='uppercase font-semibold text-xs'>Filter by due by</p>
            {ordersListFilterByOrderDueOptions.map((option) => (
              <FilterOptionSelectDropdown
                key={option.value}
                value={option.value}
                label={option.label}
                onChange={() => handleDueByChange(option.value)}
                checked={option.value === orderFilters.filterByDueBy}
              />
            ))}
          </div>

          <Divider className='my-3' />
          <div className='flex flex-col gap-3 min-w-60 dropdownRadio pr-2'>
            <p className='uppercase font-semibold text-xs'>Filter by assigned user</p>
            {ordersListFilterByAssignedUserOptions.map((option) => (
              <FilterOptionSelectDropdown
                key={option.value}
                value={option.value}
                label={option.label}
                onChange={() => handleAssignedUserChange(option.value)}
                checked={option.value === orderFilters.filterByAssignedUser}
              />
            ))}
          </div>
        </When>
      </div>
    ),
    [
      filteredOrdersListOptions,
      orderFilters,
      userRole.isDesignLabUser,
      userRole.isAlignerCompanyOrg,
      filter?.SENT,
      handleOrderStatusChange,
      handleDueByChange,
      handleAssignedUserChange,
    ]
  )

  return (
    <Popover
      content={popoverContent}
      overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree'}}
      placement='bottom'
      trigger={['click']}
      className='transition ease-in-out duration-200'
    >
      <button
        className={clsx(
          'md:w-fit w-full rounded-lg flex justify-center items-center border px-2 py-1 md:ml-2 border-mediumGray text-textColor'
        )}
        type='button'
      >
        <FunnelIcon />
        <span className='ml-1'>Filter</span>
      </button>
    </Popover>
  )
}

export default React.memo(Filter)
