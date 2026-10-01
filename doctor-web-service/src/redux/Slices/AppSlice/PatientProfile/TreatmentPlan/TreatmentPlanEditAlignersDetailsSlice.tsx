// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_TREATMENT_PLAN_EDIT_ALIGNER_DETAILS} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataTreatmentPlanEditAlignersDetails = createAsyncThunk(
  'api/postDataTreatmentPlanEditAlignersDetails',
  async (postDataTreatmentPlanEditAlignersDetails: ApiPostData, {rejectWithValue}) => {
    try {
      // const response = await axios.post<ApiResponse>(
      //   URL_TREATMENT_PLAN_EDIT_ALIGNER_DETAILS,
      //   JSON.stringify(postDataTreatmentPlanEditAlignersDetails.data),
      //   config
      // )
      const response = await apiHelper(
        URL_TREATMENT_PLAN_EDIT_ALIGNER_DETAILS,
        HttpMethod.POST,
        postDataTreatmentPlanEditAlignersDetails.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const TreatmentPlanEditAlignersDetailsSlice = createSlice({
  name: 'apiTreatmentPlanEditAlignersDetails',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataTreatmentPlanEditAlignersDetails: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataTreatmentPlanEditAlignersDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataTreatmentPlanEditAlignersDetails.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataTreatmentPlanEditAlignersDetails.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataTreatmentPlanEditAlignersDetails} =
  TreatmentPlanEditAlignersDetailsSlice.actions
export default TreatmentPlanEditAlignersDetailsSlice.reducer
