import ProductionStatusFilterBar from 'screens/Production/components/productionFilterSection/components/ProductionStatusFilterBar'
import InputSearch from 'components/atom/Inputs/InputSearch'
import {ProductionFilter, ProductionStatus} from 'screens/Production/types/productionModule.types'
import type {optionType} from 'types/optionType'
import {ITotalOrders} from 'screens/Production/types/productionOrders.interface'
import FilterAndSortButton from './components/FilterAndSortButton'

interface ProductionFilterSectionProps {
  handleFilterChange: (option: ProductionStatus) => void
  filter: ProductionFilter
  searchName: string
  brandList: optionType[] | null
  onSearch: (e: any) => void
  totalOrders: ITotalOrders | undefined
  setSearchName: (value: string) => void
}

const ProductionFilterSection = ({
  handleFilterChange,
  filter,
  brandList,
  onSearch,
  searchName,
  totalOrders,
  setSearchName,
}: ProductionFilterSectionProps) => {
  return (
    <div className='flex justify-between'>
      <ProductionStatusFilterBar {...{handleFilterChange, filter, totalOrders, setSearchName}} />
      <div className='flex md:flex-row flex-col gap-4 items-center'>
        <FilterAndSortButton
          {...{
            brandList,
            filter,
          }}
        />

        <InputSearch
          name='patientSearch'
          placeholder='Search Patient'
          onChange={onSearch}
          value={searchName}
          maxLength={30}
        />
      </div>
    </div>
  )
}

export default ProductionFilterSection
