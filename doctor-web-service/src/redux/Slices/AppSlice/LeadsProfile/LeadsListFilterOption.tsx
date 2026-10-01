import {createSlice} from '@reduxjs/toolkit'
import hasValue from 'utils/hasValue'

const LeadsListFilterOptionSlice = createSlice({
  name: 'filterAndSort',
  initialState: {
    selectedPracticeLocation: [],
    selectedTreatmentTypeOption: [],
    selectedServiceTypeOption: [],
    selectAddedByOption: 'NO_FILTER',
    filterCount: 0,
  },
  reducers: {
    setSelectedTreatmentType(state, action) {
      state.selectedTreatmentTypeOption = action.payload
    },
    setSelectedServiceType(state, action) {
      state.selectedServiceTypeOption = action.payload
    },

    setSelectedPracticeLocation(state, action) {
      state.selectedPracticeLocation = action.payload
    },
    setSelectAddedByOption(state, action) {
      state.selectAddedByOption = action.payload
    },
    handleReset(state) {
      ;((state.selectedPracticeLocation = []),
        (state.selectedTreatmentTypeOption = []),
        (state.selectedServiceTypeOption = []),
        (state.selectAddedByOption = 'NO_FILTER'))
    },

    applyFilterSort(state, action: any) {
      const {
        practiceLocationList,
        treatmentList,
        serviceTypeList,
        addedBy,
      }: {
        practiceLocationList: string[]
        treatmentList: string[]
        serviceTypeList: string[]
        addedBy: string
        status: any
      } = action.payload

      state.filterCount =
        (practiceLocationList?.length > 0 ? 1 : 0) +
        (treatmentList?.length > 0 ? 1 : 0) +
        (serviceTypeList?.length > 0 ? 1 : 0) +
        (hasValue(addedBy) && addedBy !== 'NO_FILTER' ? 1 : 0)
    },
  },
})

export const FilterSortActions = LeadsListFilterOptionSlice.actions
export default LeadsListFilterOptionSlice.reducer
