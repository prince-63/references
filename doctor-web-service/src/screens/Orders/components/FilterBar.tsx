import clsx from 'clsx'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {orderNavigationItem, orderPageTabItems, ordersPageFilterBar} from '../orders.types'
import ordersPageFilterNavItems from '@staticData/ordersPageFilterNavItems'
import ordersPageFilterBarConstants from '@constants/ordersPageFilterBar.constants'
import useAllUserRoles from '@hooks/useAllUserPlan'
import {resetOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'

interface INavBar {
  filter: ordersPageFilterBar
  handleFilterChange: (option: orderNavigationItem) => void
}
const FilterBar = ({filter, handleFilterChange}: INavBar) => {
  const {loadingOrderList, orderList} = useSelector((state: RootState) => state.orders)
  const {dispatchAction} = useDispatchAction()
  const {isEnterprisePlanUser, isGrowthPlanUser} = useAllUserRoles()
  const navigate = useNavigate()

  const callFilterNavBar = (item: orderPageTabItems) => {
    if (item.value === 'CUSTOMER') {
      const queryParams = new URLSearchParams({
        customerOrders: 'true',
      }).toString()
      navigate(`/orders?${queryParams}`)
    } else if (item.value === 'SENT') {
      const queryParams = new URLSearchParams({
        sent: 'true',
      }).toString()
      navigate(`/orders?${queryParams}`)
    } else {
      navigate('/orders')
    }
    handleFilterChange(item.value)
    dispatchAction(resetOrderFilters())
  }

  const shouldRenderFilterItem = (value: string): boolean => {
    if (isGrowthPlanUser) {
      return !['PRACTICE', 'SENT'].includes(value)
    } else if (isEnterprisePlanUser) {
      return !['PRACTICE', 'RECEIVED'].includes(value)
    } else {
      return !['PRACTICE', 'CUSTOMER', 'SENT'].includes(value)
    }
  }

  const getCountByValue = (value: string): number => {
    const details = orderList?.pagination_details || {}
    switch (value) {
      case ordersPageFilterBarConstants.RECEIVED:
        return details.received ?? 0
      case ordersPageFilterBarConstants.SENT:
        return details.sent ?? 0
      case ordersPageFilterBarConstants.CUSTOMER:
        return details.received_by_customer ?? 0
      case ordersPageFilterBarConstants.PRACTICE:
        return details.received_by_practice ?? 0
      case ordersPageFilterBarConstants.LABS:
        return details.sent ?? 0
      default:
        return 0
    }
  }

  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full  text-textColor text-base font-semibold overflow-x-auto'>
      {ordersPageFilterNavItems.map((item) => {
        if (!shouldRenderFilterItem(item.value)) return null

        return (
          <button
            key={item.value}
            disabled={loadingOrderList}
            className={clsx(
              'py-2 cursor-pointer min-w-max',
              filter[item.value] && 'text-primaryColor border-b-2 border-primaryColor'
            )}
            onClick={() => {
              dispatchAction(resetOrderFilters())
              callFilterNavBar(item)
            }}
          >
            {isGrowthPlanUser && item.value === 'SENT' ? 'Sent' : item.label} (
            {getCountByValue(item.value)})
          </button>
        )
      })}
    </div>
  )
}

export default FilterBar
