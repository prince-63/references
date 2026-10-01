import {optionType} from 'types/optionType'
import RadioGroup from 'components/RadioGroup/RadioGroup'
import reminderOptions from '@staticData/reminderOptions'
import sortOrderOptions from '@staticData/sortOrderOptions'
import CheckboxListWithSearch from 'components/checkboxListWithSearch/CheckboxListWithSearch'
import {useDispatch, useSelector} from 'react-redux'
import {applyFilterSort} from 'redux/Slices/AppSlice/production/production.slice'
import {
  ProductionFilter,
  ProductionFilterOptionsWithoutAllOrders,
} from 'screens/Production/types/productionModule.types'
import When from 'components/when/When'
import {RootState} from 'redux/store'
import {FilterSortActions} from 'redux/Slices/AppSlice/production/filterAndSort.slice'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {useState} from 'react'
import {identifyUser} from 'utils/ConstFunctions'

const FilterAndSortContent = ({
  brandList,
  hide,
  filter,
}: {
  brandList: optionType[] | null
  hide: () => void
  filter: ProductionFilter
}) => {
  const {
    selectedItems,
    selectedReminderFilterOption,
    selectedSortOptionForReminder,
    selectedSortForStartDate,
    selectedSortForCurrentAlignerDueDate,
  } = useSelector((state: RootState) => state.productionFilterAndSort)

  const dispatch = useDispatch()
  const activeFilter = getActiveFilter<ProductionFilterOptionsWithoutAllOrders>({
    filter,
  })
  const handleApply = (): void => {
    identifyUser()

    if (filter.ALL_ORDERS) {
      dispatch(
        applyFilterSort({
          alignerBrands: selectedItems,
          reminderSet: selectedReminderFilterOption,
          reminderSort: selectedSortOptionForReminder,
          startDateSort: '',
          dueDateSort: '',
          status: activeFilter,
        } as any)
      )
    } else {
      dispatch(
        applyFilterSort({
          alignerBrands: selectedItems,
          startDateSort: selectedSortForStartDate,
          reminderSet: '',
          reminderSort: '',
          dueDateSort: selectedSortForCurrentAlignerDueDate,
          status: activeFilter,
        } as any)
      )
    }

    hide()
  }
  const [searchTermForClinic, setSearchTermForClinic] = useState<string>('')

  return (
    <div className='h-[488px] w-[328px] rounded-lg flex flex-col gap-5 text-textColor'>
      <CheckboxListWithSearch
        searchTerm={searchTermForClinic}
        setSearchTerm={setSearchTermForClinic}
        searchInputPlaceHolder='Search brand name'
        items={brandList?.map((brand) => brand.label) ?? []}
        selectedItems={selectedItems}
        setSelectedItems={(items) => {
          dispatch(FilterSortActions.setSelectedItem(items))
        }}
      />
      <When isTrue={filter.ALL_ORDERS}>
        <RadioGroup
          options={reminderOptions}
          onOptionChange={(option) => {
            dispatch(FilterSortActions.handleFilterByReminderChange(option))
          }}
          selectedOption={selectedReminderFilterOption}
          label='Filter by reminders'
        />
        <hr className='border-b text-mediumGray' />
        <RadioGroup
          options={sortOrderOptions}
          onOptionChange={(option) => {
            dispatch(FilterSortActions.handleSortOptionChange(option))
          }}
          selectedOption={selectedSortOptionForReminder}
          label='Sort by reminder date'
        />
      </When>

      <When isTrue={!filter.ALL_ORDERS}>
        <RadioGroup
          options={sortOrderOptions}
          onOptionChange={(option) => {
            dispatch(FilterSortActions.handleSortForStartDateChange(option))
          }}
          selectedOption={selectedSortForStartDate}
          label='Sort by start date of order'
        />
        <hr className='border-b text-mediumGray' />
        <RadioGroup
          options={sortOrderOptions}
          onOptionChange={(option) => {
            dispatch(FilterSortActions.handleSortForCurrentAlignerDueDateChange(option))
          }}
          selectedOption={selectedSortForCurrentAlignerDueDate}
          label='Sort by current aligner due date'
        />
      </When>

      <div className='flex justify-between text-sm '>
        <button
          className='w-36 h-10 font-medium bg-white border border-textColor rounded '
          onClick={() => {
            dispatch(FilterSortActions.handleReset())
          }}
        >
          Reset
        </button>
        <button
          className='w-36 h-10 text-sm font-medium bg-primaryColor  text-white rounded-sm '
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default FilterAndSortContent
