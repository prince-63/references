// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ALIGNER_WISE_WEAR_STATS} from '../../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../../@utils/apiHelper'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAlignerWiseWearStats = createAsyncThunk(
  'api/postDataAlignerWiseWearStats',
  async (postDataAlignerWiseWearStats: ApiPostData, {rejectWithValue}) => {
    const {patient_id, aligner_no, alignerJourneyId} = postDataAlignerWiseWearStats.data
    try {
      const response = await apiHelper(
        URL_ALIGNER_WISE_WEAR_STATS +
          `${patient_id}/date_wise/${aligner_no}?aligner_journey_id=${alignerJourneyId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const AlignerWiseWearStatsSlice = createSlice({
  name: 'apiAlignerWiseWearStats',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataAlignerWiseWearStats: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAlignerWiseWearStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAlignerWiseWearStats.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAlignerWiseWearStats.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataAlignerWiseWearStats} = AlignerWiseWearStatsSlice.actions
export default AlignerWiseWearStatsSlice.reducer
