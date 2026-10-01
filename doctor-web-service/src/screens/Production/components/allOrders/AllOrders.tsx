import {useState} from 'react'
import SearchResultsPagination from 'components/searchResultsPagination/SearchResultsPagination'
import {ItemRender} from '../../helpers/ItemRender'
import OrderListItem from './components/orderListItem/OrderListItem'
import {IProductionOrder} from '../../types/productionOrders.interface'

const AllOrders = ({productionOrders}: {productionOrders: IProductionOrder[]}) => {
  const PAGE_SIZE = 10
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentOrders = productionOrders.slice(startIndex, endIndex)

  return (
    <div className='flex flex-col justify-between gap-4 h-[calc(100vh-4rem)]'>
      <div className='overflow-auto border shadow rounded-lg p-3 all-orders'>
        {currentOrders.map((orderItem) => (
          <OrderListItem key={orderItem.patient.id} {...{orderItem}} />
        ))}
      </div>
      <div className='flex justify-between'>
        <div className='hide-pagination flex items-center'>
          <p className='text-textColor font-medium text-sm'>Show</p>
          <SearchResultsPagination
            entities={productionOrders}
            pager={{
              totalPages: Math.ceil(productionOrders.length / pageSize),
              total: productionOrders.length,
            }}
            pageNumber={pageNumber}
            setPageNumber={setCurrentPageNumber}
            showSizeChanger
            itemRender={ItemRender}
            pageSize={pageSize}
            onShowSizeChange={(_, size) => {
              setPageSize(size)
            }}
          />
        </div>
        <SearchResultsPagination
          entities={productionOrders}
          pager={{
            totalPages: Math.ceil(productionOrders.length / pageSize),
            total: productionOrders.length,
          }}
          pageNumber={pageNumber}
          pageSize={pageSize}
          current={pageNumber}
          setPageNumber={setCurrentPageNumber}
          itemRender={ItemRender}
        />
      </div>
    </div>
  )
}

export default AllOrders
