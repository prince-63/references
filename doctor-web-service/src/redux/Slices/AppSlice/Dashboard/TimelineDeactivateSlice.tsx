// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_DEACTIVATE_EVENT_UPDATE} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataTimelineDeactivate = createAsyncThunk(
  'api/postDataTimelineDeactivate',
  async (postDataTimelineDeactivate: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_DEACTIVATE_EVENT_UPDATE,
        HttpMethod.POST,
        postDataTimelineDeactivate.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const TimelineDeactivateSlice = createSlice({
  name: 'apiPatientNudge',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataTimelineDeactivate: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataTimelineDeactivate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataTimelineDeactivate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataTimelineDeactivate.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataTimelineDeactivate} = TimelineDeactivateSlice.actions
export default TimelineDeactivateSlice.reducer
