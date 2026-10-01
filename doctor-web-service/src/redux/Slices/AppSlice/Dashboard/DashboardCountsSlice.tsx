// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_DASHBOARD_COUNTS} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataDashboardCounts = createAsyncThunk(
  'api/postDataDashboardCounts',
  async (postDataDashboardCounts: ApiPostData, {rejectWithValue}) => {
    const doctor_id = postDataDashboardCounts.data.doctor_id
    try {
      const response = await apiHelper(URL_DASHBOARD_COUNTS + doctor_id, HttpMethod.GET)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const DashboardCounts = createSlice({
  name: 'apiDashboardCounts',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataDashboardCounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataDashboardCounts.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataDashboardCounts.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default DashboardCounts.reducer
