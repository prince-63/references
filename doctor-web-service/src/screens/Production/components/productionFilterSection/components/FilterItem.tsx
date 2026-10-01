import sortOrderConstants from '@constants/sortOrder.constants'
import {AnyAction, ThunkDispatch} from '@reduxjs/toolkit'
import clsx from 'clsx'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {FilterSortActions} from 'redux/Slices/AppSlice/production/filterAndSort.slice'
import {
  applyFilterSort,
  postApiDataProductionSlice,
} from 'redux/Slices/AppSlice/production/production.slice'
import {RootState} from 'redux/store'
import {
  ProductionFilter,
  ProductionFilterOption,
  ProductionStatus,
} from 'screens/Production/types/productionModule.types'
import {safeParseInt} from 'utils/ConstFunctions'

const FilterItem = ({
  option,
  handleFilterChange,
  className,
  filter,
  numberOfItems,
  setSearchName,
}: {
  option: Pick<ProductionFilterOption, 'value' | 'label'>
  handleFilterChange: (option: ProductionStatus) => void
  className?: string
  filter: ProductionFilter
  numberOfItems: number
  setSearchName: (value: string) => void
}) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch()
  const {userId} = useContext(AuthContext)
  const {loading} = useSelector((state: RootState) => state.production)

  return (
    <div>
      <button
        key={option.value}
        disabled={loading}
        className={clsx(
          'font-medium text-sm px-1.5 py-[6px]',
          className,
          filter[option.value]
            ? 'bg-primarySupport rounded-md text-primaryColor'
            : 'bg-white text-textColor'
        )}
        onClick={() => {
          setSearchName('')
          handleFilterChange(option.value)

          dispatch(
            postApiDataProductionSlice({
              status: option.value !== 'ALL_ORDERS' ? option.value : '',
              doctorId: safeParseInt(userId),
            })
          )

          dispatch(FilterSortActions.handleReset())
          if (option.value === 'ALL_ORDERS') {
            dispatch(
              applyFilterSort({
                alignerBrands: [],
                reminderSet: '',
                reminderSort: sortOrderConstants.OLDEST_TO_NEWEST,
                startDateSort: '',
                dueDateSort: '',
                status: option.value,
              } as any)
            )
          } else {
            dispatch(
              applyFilterSort({
                alignerBrands: [],
                startDateSort: sortOrderConstants.OLDEST_TO_NEWEST,
                reminderSet: '',
                reminderSort: '',
                dueDateSort: '',
                status: option.value,
              } as any)
            )
          }
        }}
      >
        {option.label} ({numberOfItems})
      </button>
    </div>
  )
}

export default FilterItem
