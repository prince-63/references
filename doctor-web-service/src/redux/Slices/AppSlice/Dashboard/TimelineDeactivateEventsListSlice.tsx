// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_DEACTIVATE_EVENT_LIST} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

export const TimelineDeactivateEventsList = createAsyncThunk(
  'api/postDataTimelineDeactivateEventsList',
  async (
    postDataTimelineDeactivateEventsList: {
      doctorId: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_DEACTIVATE_EVENT_LIST}/${postDataTimelineDeactivateEventsList.doctorId}/ALL`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const TimelineDeactivateEventsListSlice = createSlice({
  name: 'apiTimelineDeactivateEventsList',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataTimelineDeactivateEventsList: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(TimelineDeactivateEventsList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(TimelineDeactivateEventsList.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(TimelineDeactivateEventsList.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataTimelineDeactivateEventsList} = TimelineDeactivateEventsListSlice.actions
export default TimelineDeactivateEventsListSlice.reducer
