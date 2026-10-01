// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_UPDATE_REMINDER} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataReminderUpdate = createAsyncThunk(
  'api/postApiDataReminderUpdate',
  async (postDataReminderUpdate: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_UPDATE_REMINDER,
        HttpMethod.POST,
        postDataReminderUpdate.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const ReminderUpdateSlice = createSlice({
  name: 'apiReminderUpdate',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataReminderUpdate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataReminderUpdate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataReminderUpdate.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default ReminderUpdateSlice.reducer
