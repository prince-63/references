import clsx from 'clsx'
import productionStatusTypesConstants from '@constants/productionStatusTypes.constants'
import productionStatusFilterOptions from '@staticData/productionStatusFilterOptions'
import {ProductionFilter, ProductionStatus} from 'screens/Production/types/productionModule.types'
import FilterItem from 'screens/Production/components/productionFilterSection/components/FilterItem'
import {ITotalOrders} from 'screens/Production/types/productionOrders.interface'

const ProductionStatusFilterBar = ({
  handleFilterChange,
  filter,
  totalOrders,
  setSearchName,
}: {
  handleFilterChange: (option: ProductionStatus) => void
  filter: ProductionFilter
  totalOrders: ITotalOrders | undefined
  setSearchName: (value: string) => void
}) => {
  return (
    <div className='flex gap-3 items-center '>
      <FilterItem
        key={productionStatusTypesConstants.ALL_ORDERS}
        option={productionStatusFilterOptions[0]}
        handleFilterChange={handleFilterChange}
        setSearchName={setSearchName}
        filter={filter}
        className={clsx(
          'border border-mediumGray rounded-lg px-3 py-[6px]',
          filter[productionStatusTypesConstants.ALL_ORDERS] && 'border-primaryColor'
        )}
        numberOfItems={totalOrders?.total_orders ?? 0}
      />
      <div className='border-r border-mediumGray h-10' />
      <div className='flex rounded-lg border border-lightGray gap-1 bg-white p-1'>
        {productionStatusFilterOptions.slice(1).map((option) => {
          if (option.value === productionStatusTypesConstants.ALL_ORDERS) return null
          return (
            <FilterItem
              key={option.value}
              option={option}
              handleFilterChange={handleFilterChange}
              setSearchName={setSearchName}
              filter={filter}
              numberOfItems={totalOrders?.status_wise_total_orders[option.value] ?? 0}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProductionStatusFilterBar
