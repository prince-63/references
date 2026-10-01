import When from 'components/when/When'
import {ProductionFilter} from '../types/productionModule.types'
import AllOrders from './allOrders/AllOrders'
import EmptyState from './EmptyState'
import {IProductionOrder} from '../types/productionOrders.interface'
import hasValue from 'utils/hasValue'
import ProductionStatus from './productionStatus/ProductionStatus'

const ProductionMainBody = ({
  filter,
  productionOrders,
  searchName,
}: {
  filter: ProductionFilter
  productionOrders: IProductionOrder[] | null | undefined
  searchName: string
}) => {
  return (
    <div className='mt-4'>
      <When isTrue={!hasValue(productionOrders) && !hasValue(searchName)}>
        <EmptyState filter={filter} />
      </When>
      <When isTrue={searchName !== '' && !hasValue(productionOrders)}>
        <div className='w-full text-center '>No matching patients found.</div>
      </When>
      <When isTrue={hasValue(productionOrders) && filter.ALL_ORDERS}>
        {productionOrders && <AllOrders {...{productionOrders}} />}
      </When>
      <When isTrue={!filter.ALL_ORDERS && hasValue(productionOrders)}>
        {productionOrders && (
          <ProductionStatus productionOrders={productionOrders} filter={filter} />
        )}
      </When>
    </div>
  )
}

export default ProductionMainBody
