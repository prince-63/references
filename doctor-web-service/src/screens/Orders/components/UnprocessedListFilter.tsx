import orderDueByFilterConstants from '@constants/orderDueByFilter.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Popover} from 'antd'
import FunnelIcon from 'assets/icons/FunnelIcon'
import clsx from 'clsx'
import {useSelector} from 'react-redux'
import {setUnprocessedOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'

const UnprocessedListFilter = ({
  handleFilterOrder,
}: {
  handleFilterOrder: ({
    customer_id,
    due_by_filter,
  }: {
    customer_id?: string | null
    due_by_filter?: null | string
  }) => void
}) => {
  const {orderUnprocessedFilters} = useSelector((state: RootState) => state.orders)
  const {dispatchAction} = useDispatchAction()

  const filteredOrdersListOptions = [
    {label: 'All ', value: orderDueByFilterConstants.ALL},
    {label: 'Overdue ', value: orderDueByFilterConstants.OVERDUE},
    {label: 'Due today ', value: orderDueByFilterConstants.DUE_TODAY},
    {label: 'Due this week', value: orderDueByFilterConstants.DUE_THIS_WEEK},
    {label: 'Due later', value: orderDueByFilterConstants.DUE_LATER},
  ]

  return (
    <Popover
      content={
        <div className='flex flex-col gap-2 p-4 text-textColor max-h-[75vh] overflow-y-auto'>
          <div className='flex flex-col gap-3 min-w-60  dropdownRadio pr-2'>
            <p className='uppercase font-semibold text-xs'>due by</p>
            {filteredOrdersListOptions.map((option) => (
              <FilterOptionSelectDropdown
                key={option.value}
                value={option.value}
                label={option.label}
                onChange={() => {
                  dispatchAction(setUnprocessedOrderFilters({filterDueBy: option.value}))
                  handleFilterOrder({
                    due_by_filter: option.value,
                    customer_id: orderUnprocessedFilters?.selected_customer,
                  })
                }}
                checked={option.value === orderUnprocessedFilters.filterDueBy}
              />
            ))}
          </div>
        </div>
      }
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

export default UnprocessedListFilter
