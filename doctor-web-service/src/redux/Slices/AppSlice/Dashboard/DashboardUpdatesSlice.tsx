// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_DASHBOARD_EDIT_LABELS,
  URL_DASHBOARD_UPDATES_NOTIFICATION,
} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

export interface ApiPostNotificationData {
  doctor_id: number
  active: boolean
  page: number
  size: number
  allowed_event_types: string[]
}

export const postApiDataDashboardUpdates = createAsyncThunk(
  'api/postDataDashboardUpdates',
  async (postData: ApiPostNotificationData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_DASHBOARD_UPDATES_NOTIFICATION,
        HttpMethod.POST,
        postData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

interface postData {
  home: string
  workspace: string
  customer_view: string
  lab_view: string
}

export const DashboardLabelEdit = createAsyncThunk(
  'api/DashboardLabelEdit',
  async (postData: postData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_DASHBOARD_EDIT_LABELS, HttpMethod.POST, postData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const DashboardUpdatesSlice = createSlice({
  name: 'apiDashboardUpdates',
  initialState: {
    data: [] as ApiResponse | [],
    dataLabelUpdate: {},
    loadingLabelUpdate: false,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataDashboardUpdates: (state) => {
      state.data = []
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataDashboardUpdates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataDashboardUpdates.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataDashboardUpdates.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(DashboardLabelEdit.pending, (state) => {
        state.loadingLabelUpdate = true
      })
      .addCase(DashboardLabelEdit.fulfilled, (state, action) => {
        state.loadingLabelUpdate = false
        state.dataLabelUpdate = action.payload
      })
  },
})

export const {clearDataDashboardUpdates} = DashboardUpdatesSlice.actions

export default DashboardUpdatesSlice.reducer
