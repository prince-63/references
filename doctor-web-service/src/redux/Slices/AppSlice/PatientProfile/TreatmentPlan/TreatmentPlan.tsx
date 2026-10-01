// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_TREATMENT_PLAN} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataTreatmentPlan = createAsyncThunk(
  'api/postDataTreatmentPlan',
  async (postDataTreatmentPlan: ApiPostData, {rejectWithValue}) => {
    const {patient_id, alignerJourneyId} = postDataTreatmentPlan.data
    try {
      const response = await apiHelper(
        URL_TREATMENT_PLAN +
          `${patient_id}?create_status=IN_PROGRESS&create_status=DONE&progress_status=&progress_status=NOT_STARTED&progress_status=IN_PROGRESS&progress_status=COMPLETE&progress_status=DISCARDED&aligner_journey_id=${alignerJourneyId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.error_code)
    }
  },
  {
    condition: (_postDataTreatmentPlan, {getState}) => {
      const state = getState() as {apiTreatmentPlan?: {loading?: boolean}}
      return !state.apiTreatmentPlan?.loading
    },
  }
)
const initialState = {
  data: null as ApiResponse | null,
  error: null as string | null,
  loading: false,
  treatmentNo: null,
  selectedTreatment: null,
  isDiscardedTreatment: false,
  isEditWearDaysModelOpen: false,
  isUpdateStartDateModalOpen: false,
  isProductionLogsModelOpen: false,
  isSomeAlignerSelected: false,
  latestTreatmentStartData: '',
}

const TreatmentPlanSlice = createSlice({
  name: 'apiTreatmentPlan',
  initialState,
  reducers: {
    setTreatmentNo: (state, action) => {
      state.treatmentNo = action.payload
    },
    setSelectedTreatment: (state, action) => {
      state.selectedTreatment = action.payload
    },
    setIsDiscardedTreatment: (state, action) => {
      state.isDiscardedTreatment = action.payload
    },
    setIsEditWearDaysModelOpen: (state, action) => {
      state.isEditWearDaysModelOpen = action.payload
    },

    setProductionLogsModelOpen: (state, action) => {
      state.isProductionLogsModelOpen = action.payload
    },
    setIsSomeAlignerSelected: (state, action) => {
      state.isSomeAlignerSelected = action.payload
    },
    resetTreatmentPlanState: () => ({...initialState}),
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataTreatmentPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataTreatmentPlan.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataTreatmentPlan.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
        state.data = null
      })
  },
})
export const {
  setTreatmentNo,
  setSelectedTreatment,
  setIsDiscardedTreatment,
  setIsEditWearDaysModelOpen,
  setIsSomeAlignerSelected,
  setProductionLogsModelOpen,
  resetTreatmentPlanState,
} = TreatmentPlanSlice.actions

export default TreatmentPlanSlice.reducer
