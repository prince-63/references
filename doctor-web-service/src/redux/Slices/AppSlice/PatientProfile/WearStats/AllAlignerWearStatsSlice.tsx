// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ALL_ALIGNER_WEAR_STATS} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAllAlignerWearStats = createAsyncThunk(
  'api/postDataAllAlignerWearStats',
  async (postDataAllAlignerWearStats: ApiPostData, {rejectWithValue}) => {
    const {patient_id, alignerJourneyId} = postDataAllAlignerWearStats.data
    try {
      const response = await apiHelper(
        URL_ALL_ALIGNER_WEAR_STATS +
          `${patient_id}/aligner_wise?aligner_journey_id=${alignerJourneyId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const AllAlignerWearStatsSlice = createSlice({
  name: 'apiAllAlignerWearStats',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataAllAlignerWearStats: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAllAlignerWearStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAllAlignerWearStats.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAllAlignerWearStats.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataAllAlignerWearStats} = AllAlignerWearStatsSlice.actions
export default AllAlignerWearStatsSlice.reducer
