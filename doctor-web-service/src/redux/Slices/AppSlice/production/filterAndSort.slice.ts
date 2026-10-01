import sortOrderConstants from '@constants/sortOrder.constants'
import {createSlice} from '@reduxjs/toolkit'

const FilterSortSlice = createSlice({
  name: 'filterAndSort',
  initialState: {
    selectedItems: [],
    selectedReminderFilterOption: '' as string,
    selectedSortOptionForReminder: sortOrderConstants.OLDEST_TO_NEWEST as string,
    selectedSortForStartDate: sortOrderConstants.OLDEST_TO_NEWEST as string,
    selectedSortForCurrentAlignerDueDate: '' as string,
  },
  reducers: {
    handleFilterByReminderChange(state, action) {
      state.selectedReminderFilterOption = action.payload
    },
    handleSortOptionChange(state, action) {
      state.selectedSortOptionForReminder = action.payload
    },
    handleSortForStartDateChange(state, action) {
      state.selectedSortForStartDate = action.payload
      state.selectedSortForCurrentAlignerDueDate = ''
    },
    handleSortForCurrentAlignerDueDateChange(state, action) {
      state.selectedSortForCurrentAlignerDueDate = action.payload
      state.selectedSortForStartDate = ''
    },
    setSelectedItem(state, action) {
      state.selectedItems = action.payload
    },
    handleReset(state) {
      ;((state.selectedItems = []),
        (state.selectedReminderFilterOption = ''),
        (state.selectedSortOptionForReminder = sortOrderConstants.OLDEST_TO_NEWEST),
        (state.selectedSortForStartDate = sortOrderConstants.OLDEST_TO_NEWEST),
        (state.selectedSortForCurrentAlignerDueDate = ''))
    },
  },
})

export const FilterSortActions = FilterSortSlice.actions
export default FilterSortSlice.reducer
